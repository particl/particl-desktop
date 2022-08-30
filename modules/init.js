const { ipcMain } = require('electron');
const { Observable, isObservable, Subject } = require('rxjs');
const { takeUntil } = require('rxjs/operators');


const InitializationStatus = {
  Stopped: 0,
  Starting: 1,
  Started: 2,
};


const textContent = {
  INITIALIZATION_STARTING: 'Loading modules...',
  INIT_COMPLETE: 'Module loading complete',
  MODULE_LOADING: 'Initializing module: ${mod}',
  MODULE_ADD_EVENTS: 'Adding module events: ${mod}',
  MODULE_LOAD_ERROR: 'Error loading module: ${mod}'
};

/**
 * Handles all of:
 *  - proxying channels from modules, allowing for preload.js channels/functions to be added from the module itself, rather than needing to hardcode the channels in the preload.js script,
 *  - validating the channels and listeners,
 *  - allowing for use of observables in the backend (and technically the frontend, but requires some processing on the frontend to get right)
 *
 */
class ModuleManager {

  #startedStatus = InitializationStatus.Stopped;

  #obsDestroyer = new Subject();

  #channelListeners = {
    on: {},             // channels for backend to receive data from frontend on (single call without response required)
    invoke: {},         // channels for backend to receive data from frontend on, and reply with some data (uses observables)
    send: new Map(),    // holds the observables to which a frontend renderer might be listening for data on (channels are created automatically) - mostly internal
    destroyFuncs: [],
    emitter: {},        // backend emitters, that a frontend renderer simply listens to data on (comms initiated via backend... there may be 0 or more renderers receiving the data)
  };


  constructor() {
    ipcMain.handle('PD_SEND_AND_WAIT', this.#handleInvoke.bind(this));
    ipcMain.on('PD_SEND', this.#handleSend.bind(this));
    ipcMain.on('PD_REMOVE_LISTENER', this.#handleRemoveListener.bind(this));

    this.#setupOwnListeners();
  }


  async cleanup(shutdown = false) {
    // allow observables to clean themselves up
    this.#obsDestroyer.next();
    if (shutdown) {
      this.#obsDestroyer.complete();
    }

    // destroy 'on' events
    this.#channelListeners.on = {};

    // destroy observable reference
    const obsKeys = Object.keys(this.#channelListeners.invoke);
    obsKeys.forEach(key => {
      if (shutdown ? true : (key !== 'init-system')) {
        delete this.#channelListeners.invoke[key];
      }
    });

    // clean out listener channels
    for (const receiverKey of this.#channelListeners.send.keys()) {
      this.#removeListener(receiverKey, null);
    }

    // run destroy functions on each module if provided
    for (const fn of this.#channelListeners.destroyFuncs) {
      try {
        if (this.#isRegularFunction(fn)) {
          fn();
        } else if (this.#isAsyncFunction(fn)) {
          await fn();
        }
      } catch(err) {
        // TODO: log this out correctly
        console.log('Error caught running destroy function:', err);
      }
    }
    this.#channelListeners.destroyFuncs = [];

    this.#startedStatus = InitializationStatus.Stopped;
  }


  #handleInvoke(event, channel, replyChannel, listenerType, ...data) {
    const receiver = event.sender;
    // const win = BrowserWindow.fromWebContents(receiver);
    // TODO: validate the window or webcontents here

    if ((typeof channel === 'string') && (typeof replyChannel === 'string')) {
      const channelCount = +replyChannel.replace(`${channel}:`, '');

      if (Number.isSafeInteger(channelCount) && (channelCount >= 0) && replyChannel === `${channel}:${channelCount}`) {

        if (listenerType === 'invoker' && (channel in this.#channelListeners.invoke)) {
          this.#addListener(replyChannel, receiver, this.#channelListeners.invoke[channel], ...data);
        } else if (listenerType === 'emitter' && (channel in this.#channelListeners.emitter)) {
          this.#addListener(replyChannel, receiver, this.#channelListeners.emitter[channel]);
        }

      }

    }
  }


  #handleSend(event, ...data) {
    // TODO: validate the window or webcontents here

    // this is the actual channel that is being requested
    const channelName = data.shift();

    if (typeof channelName === 'string' && channelName in this.#channelListeners.on) {
      try {
        this.#channelListeners.on[channelName](...data);
      } catch (e) {
        // TODO: log this error out somewhere?
      }
    }
  }


  #handleRemoveListener(event, channelName) {
    if (typeof channelName !== 'string') {
      return;
    }
    this.#removeListener(event.sender.id, channelName);
  }


  #setupOwnListeners() {
    if (!('init-system' in this.#channelListeners.invoke)) {
      this.#channelListeners.invoke['init-system'] = new Observable(observer => {
        if (this.#startedStatus !== InitializationStatus.Stopped) {
          observer.complete();
          return;
        }
        this.#startedStatus = InitializationStatus.Starting;
        observer.next(textContent.INITIALIZATION_STARTING);

        const modulePaths = [
          './coreManager',
          //'./zmq/zmq',
          // './market/market'
          './gui/gui',
          './gui/notification',
          './market/services',
        ];

        let success = true;

        for (const modpath of modulePaths) {
          const modName = modpath
            .split('/')
            .reduce((acc, curr) => curr !== '.' && curr.length > 0 ? `${acc}${acc.length > 0 ? ':' : ''}${curr}` : acc, '');

          try {

            observer.next(`${modName} loading`);

            const mod = require(modpath);

            observer.next(textContent.MODULE_LOADING.replace('${mod}', modName));

            if (this.#isFunction(mod['destroy'])) {
              this.#channelListeners.destroyFuncs.push(mod['destroy']);
            }

            if (this.#isRegularFunction(mod['init'])) {
                mod['init']();
            }

            observer.next(textContent.MODULE_ADD_EVENTS.replace('${mod}', modName));

            if (Object.prototype.toString.call(mod['channels']) === '[object Object]') {
              for (const listenerType of ['invoke', 'on', 'emitter']) {
                if (Object.prototype.toString.call(mod['channels'][listenerType]) === '[object Object]') {
                  for (const channelName of Object.keys(mod['channels'][listenerType])) {
                    const modChannelName = `${modName}:${channelName}`;

                    // do not re-add
                    if (!(modChannelName in this.#channelListeners[listenerType])) {
                      this.#channelListeners[listenerType][modChannelName] = mod['channels'][listenerType][channelName];
                    }
                  }
                }
              }
            }
          } catch (err) {
            observer.error(textContent.MODULE_LOAD_ERROR.replace('${mod}', modName));
            // TODO: log out the actual error
            console.log('Error loading module: ', err);
            success = false;
            break;
          }
        }

        if (success) {
          observer.next(textContent.INIT_COMPLETE);
          observer.complete();
          this.#startedStatus = InitializationStatus.Started;
        } else {
          this.cleanup(false);
        }
      });
    }
  }


  #addListener(channel, receiver, callable, ...data) {

    if (!this.#channelListeners.send.has(receiver.id)) {
      this.#channelListeners.send.set(receiver.id, {});
    }

    if (channel in this.#channelListeners.send.get(receiver.id)) {
      return true;
    }

    let observable;
    if (isObservable(callable)) {
      // callable is an observable
      observable = callable;
    } else if (this.#isRegularFunction(callable)) {
      // callable is a function and the return value should be an observable
      observable = callable(receiver, ...data);
    }

    if (observable === undefined) {
      return false;
    }

    this.#channelListeners.send.get(receiver.id)[channel] = observable.pipe(takeUntil(this.#obsDestroyer)) .subscribe({
      next: (data) => {
        receiver.send(channel, 'obs_next', data);
      },
      error: (err) => {
        receiver.send(channel, 'obs_error', err);
      },
      complete: () => {
        if (receiver && !receiver.isDestroyed()) {
          receiver.send(channel, 'obs_complete');
          delete this.#channelListeners.send[channel];
        }
      }
    });

    receiver.on('destroyed', () => {
      this.#removeListener(receiver.id, channel);
    });

    return true;
  }


  #removeListener(receiverId, channelName) {
    if (!(receiverId && this.#channelListeners.send.has(receiverId))) {
      return;
    }

    const subscribedChannels = this.#channelListeners.send.get(receiverId);

    if (channelName === null) {
      for (const ch of Object.keys(subscribedChannels)) {
        subscribedChannels[ch].unsubsribe();
      }
      this.#channelListeners.send.delete(receiverId);
    } else if (typeof channelName === 'string' && channelName in subscribedChannels) {
      const cSegs = channelName.split(':');
      if (Number.isSafeInteger(+cSegs[cSegs.length - 1])) {
        subscribedChannels[channelName].unsubscribe();
        delete subscribedChannels[channelName];
      }
    }
  }


  #isRegularFunction(fn) {
    return Object.prototype.toString.call(fn) === '[object Function]';
  }

  #isAsyncFunction(fn) {
    return Object.prototype.toString.call(fn) === '[object AsyncFunction]';
  }

  #isFunction(fn) {
    return this.#isRegularFunction(fn) || this.#isAsyncFunction(fn);
  }
}

const modmanager = new ModuleManager();

module.exports = modmanager;
