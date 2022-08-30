const { BehaviorSubject, of, Subject, defer } = require('rxjs');
const { distinctUntilChanged, concatMap, takeUntil, pairwise } = require('rxjs/operators');
const branch = require('../../package.json').branch;


class State {

  id;
  #_label;
  #_actions = {};

  constructor(id, label) {
    this.#_label = label;
    this.id = id;
  }


  async onEnter(config, nextFn) { };


  async onExit(config) { };


  async onAction(config, action) { };


  addTargetState(actionId, toState) {
    if ((typeof actionId === 'string') && (toState instanceof State)) {
      this.#_actions[actionId] = toState;
    }
  }


  actions() {
    return Object.keys(this.#_actions);
  }


  getTargetState(action) {
    if (this.#_actions[action] instanceof State) {
      return this.#_actions[action];
    }
    return null;
  }

}


class Machine {

  #_config;
  #_stateStore;
  #_destructor;
  #_isStarted;

  constructor(config, { states, initialState }) {

    this.#_config = config;

    const statesMap = new Map();
    if (Array.isArray(states)) {
      states.filter(s => s instanceof State).forEach(s => statesMap.set(s.id, s));
    }

    if (!statesMap.has(initialState)) {
      throw new Error('Invalid initial state provided');
    }

    this.#_stateStore = new BehaviorSubject(null);
    this.#_destructor = new Subject();
    this.#_isStarted = true;

    this.#_stateStore.pipe(
      distinctUntilChanged((prev, curr) =>
        prev instanceof State && curr instanceof State ? prev.id === curr.id : false
      ),
      pairwise(),
      concatMap(([oldState, newState]) => defer(async () => {
        if (oldState instanceof State) {
          await oldState.onExit(this.#_config).catch(err => console.log(`Error exiting state ${oldState.id}`, err));
        }

        if (newState instanceof State) {
          await newState.onEnter(this.#_config, this.next.bind(this)).catch(err => console.log(`Error entering state ${newState.id}`, err));
        }
        return newState;
      })),
      takeUntil(this.#_destructor)
    ).subscribe();

    setTimeout((state => this.#_stateStore.next(state)), 0, statesMap.get(initialState));
  }

  close() {
    if (this.#_isStarted) {
      this.#_destructor.next();
      this.#_destructor.complete();
      this.#_isStarted = false;
    }
  }

  currentStateId() {
    return this.#_isStarted && this.#_stateStore.getValue() ? this.#_stateStore.getValue().id : '';
  }

  async next(actionId) {
    if (!this.#_isStarted) {
      return;
    }
    const cState = this.#_stateStore.getValue();

    if (cState) {
      const targetState = cState.getTargetState(actionId);

      if (targetState) {
        await cState.onAction(this.#_config, actionId)
          .then(() => this.#_stateStore.next(targetState))
          .catch(err => console.log(`Error in onAction() for state ${cState.id}`, err));
      }
    }
  }
}


const DEFAULT_CORE_MIN_VERSION = '0.21.2.9';


// JSON Schema compatible format, see https://json-schema.org
const SETTING_SCHEMA = {
  particlCore: {
    description: "Settings for starting and configuring particl-core",
    type: 'object',
    properties: {
      startup: {
        description: "Configuration relating to the startup of particl-core",
        type: "object",
        properties: {
          autoStart: {
            description: "Attempt to start particl-core daemon on application start",
            type: "boolean",
            default: false,
          },
          connectToService: {
            description: "Connect to a running particld instance (if false, start a new instance instead)",
            type: "boolean",
            default: false,
          },
          downloadIfInvalid: {
            description: "Attempt to automatically download a particl-core version if it invalid or missing",
            type: "boolean",
            default: true,
          },
          params: {
            description: "Arguments to pass to particl-core on startup (only applicable if connectToService is false)",
            type: "array",
            items: {
              type: "string",
              pattern: "^\-.?.*$",
            },
            uniqueItems: true
          },
        }
      },
      version: {
        description: "The version of particl-core to launch (or download); Note: this should be greater than the minimum version specified",
        type: "string",
        default: DEFAULT_CORE_MIN_VERSION,
      },
      updates: {
        description: "Settings related to checking for particl-core updated versions",
        type: "object",
        properties: {
          checkForUpdates: {
            description: "Periodically check for new particl-core versions",
            type: "boolean",
            default: true,
          },
          frequency: {
            description: "Number of minutes between update checks if enabled",
            type: "integer",
            exclusiveMinimum: 0,
          },
        },
      },
      urls: {
        description: "URLs to obtain various data",
        type: "object",
        properties: {
          versionCheckUrl: {
            description: "URL to download particl-core binaries from",
            type: "string",
            // TODO Change this appropriately when the version checker has been implemented
            default: `https://raw.githubusercontent.com/particl/particl-desktop/${(branch || 'dev').replace('-', '/')}/modules/clientBinaries/clientBinaries.json`
          }
        },
      },
    }
  },
};


/**
 *  Allows for forcing updates to saved settings across different application versions
 *  Format is: 'particl desktop app version': (store) => { function to make changes to a written file }
 *  where `store` is an instance of electron-store
 *
 *  example:
 *
 *  {
      '>=3.2.2': store => {
        store.set('particlCore.version', '22.1.1');
      }
    };
 */
const SETTING_MIGRATIONS = {
};


const LOG_STATUS_TYPE = {
  INFO: 1,
  ERROR: 2,
};


class CoreController {

  #_machine;
  #_status = { type: LOG_STATUS_TYPE.INFO, message: '' };

  constructor() {
    // create states
    this.#_machine = this.#createMachine();
  }


  #createMachine() {
    const initState = new State('initial', 'initialize');
    const configState = new State('config', 'parse particl-core configuration');
    const validateState = new State('validate', 'validate particl-core');
    const dwnldState = new State('download', 'downloading particl-core');
    const startingState = new State('starting', 'starting particld');
    const connectingState = new State('connecting', 'connecting to particld');
    const connectedState = new State('connected', 'connected to particld');

    initState.addTargetState('load', configState);

    configState.addTargetState('start', validateState);
    configState.addTargetState('connect', connectingState);
    configState.addTargetState('error', initState);

    validateState.addTargetState('success', startingState);
    validateState.addTargetState('invalid', dwnldState);
    validateState.addTargetState('error', initState);

    dwnldState.addTargetState('success', validateState);
    dwnldState.addTargetState('error', initState);

    startingState.addTargetState('success', connectingState);
    startingState.addTargetState('error', initState);

    connectingState.addTargetState('success', connectedState);
    connectingState.addTargetState('error', initState);

    connectedState.addTargetState('stop', initState);

    // config state actions

    // validateState.onEnter = async (config, nextFn) => {

    // }

    // validateState.onExit = async (config) => {

    // }

    // validateState.onEnter = async (config, nextFn) => {

    // }

    // validateState.onExit = async (config) => {

    // }

    // connectingState.onEnter = async (config, nextFn) => {

    // }

    // create machine
    return new Machine(
      {},
      {
        initialState: initState.id,
        states: [
          initState,
          configState,
          validateState,
          dwnldState,
          startingState,
          connectingState,
          connectedState,
        ]
      }
    );
  }
}


const c = new CoreController();


module.exports = {
  CoreController: c,
  Settings: Object.freeze(SETTING_SCHEMA),
  Migrations: Object.freeze(SETTING_MIGRATIONS),
};