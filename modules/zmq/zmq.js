const rxIpc       = require('rx-ipc-electron/lib/main').default;
const Observable  = require('rxjs').Observable;
const _subject    = require('rxjs').Subject;
const _rxjsOperators = require('rxjs/operators');
const _zmq        = require('particl-zmq');
const log         = require('electron-log');
const _services    = require('./services');

/* Constants */
const ZMQ_CHANNEL = 'zmq';
const ZMQ_START_CHANNEL = 'zmq-connect';
const SPY_ON_ZMQ = false;

/* references */
let mainReference = null;
let zmqSocket = null;


const SUBJECTS = {};


function destroyIpcListeners() {
  rxIpc.removeListeners(ZMQ_START_CHANNEL);
}


function sendMessage(channel, type, data) {
  if (mainReference === null) {
    log.debug("zmq.send failed: no application window");
  }

  SUBJECTS[type].subject.next({channel, type, data});
}


function startZMQListener(host, port) {

  const address = `tcp://${host}:${port}`;
  const services = _services.required;

  const zmqServices = {};
  for (const service of services) {
    zmqServices[service] = address;
  }

  if (zmqSocket !== null) {
    return;
  }

  for (const service of services) {
    const sub = new _subject();

    const obs = sub.asObservable().pipe(
      _rxjsOperators.auditTime(1000)
    ).subscribe(
      (data) => {
        try {
          if (SPY_ON_ZMQ) {
            log.info('zmq.send: -> ', data.type, ', data: ', data.data)
          }
          rxIpc.runCommand(ZMQ_CHANNEL, mainReference.webContents, data.channel, data.type, data.data);
        } catch (error) {
          log.error("zmq.send: failed to runCommand (maybe window closed/closing): ", error.toString());
        }
      }
    );

    SUBJECTS[service] = {subject: sub, observer: obs};
  }

  zmqSocket = new _zmq(
    zmqServices,
    { maxRetry: 100 }
  );

  zmqSocket.connect();

  for (const service of services) {
    zmqSocket.on(service, (data) => {
      sendMessage('data', service, data.toString('hex'));
    });
  }

  zmqSocket.on('connect:*', (uri, type) => {
    log.info('ZMQ: connect:* ' + type + ', uri: ' + uri);
    sendMessage('connected', type);
  });

  zmqSocket.on('close:*', (err, type) => {
    log.info('ZMQ: close:* ' + type + ', error: ' + err);
    sendMessage('closed', type);
  });

  zmqSocket.on('retry:*', (type, attempt) => {
    log.info('ZMQ: retry:* ' + type + ', attempt: ' + attempt);
    sendMessage('retry', type, attempt);
  });

  zmqSocket.on('error:*', (err, type) => {
    log.error('ZMQ: error:* ' + type + ', error: ' + err);
    sendMessage('error', type);
  });

  log.info('ZMQ services configured');
}


const init = (mainWindow) => {
  mainReference = mainWindow;
  destroyIpcListeners();

  rxIpc.registerListener(ZMQ_START_CHANNEL, (options) => {
    return Observable.create(observer => {
      if (zmqSocket !== null) {
        log.warn('Aborting request to start ZMQ service: already started!');
        observer.next(true);
      } else if (!options.zmq_port) {
        log.error('Required zmq_port option missing');
        observer.error();
      } else {
        isStarted = true;
        log.info('Attempting to start ZMQ listeners...');

        const host = typeof options.zmq_host === 'string' && options.zmq_host.length ?
          options.zmq_host : '127.0.0.1';

        const port = options.zmq_port;

        startZMQListener(host, port);
        observer.next(true);
      }
      observer.complete();
    });
  });
};


const destroy = () => {
  if (zmqSocket) {
    log.info('disconnecting zmq socket listeners...');

    zmqSocket.disconnect().catch((e) => {
      log.warn('zmq.disconnect() error: ', e.toString());
    }).then(() => {

      for (const service of _services.required) {
        try {
          SUBJECTS[service].subject.complete();
        } catch(e) {
          log.error('Failed unsubscribing zmq channel listener... possibly leaking a listener');
        }
      }
      mainReference = null;
      zmqSocket = null;
    });
  }
  destroyIpcListeners();
  log.info('zmq disconnect complete');
}


exports.init = init;
exports.destroy = destroy;
