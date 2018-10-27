/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

// TODO: maybe move into ipc.types ?

interface Window {
  electron: boolean;
  sendNotification: Function;
  require: any;
  ipc: {
    on: (channel: string, listener: Function) => void;
    once: (channel: string, listener: Function) => void;
    send: (channel: string, arguments?: {}) => void;
    sendSync: (channel: string, arguments?: {}) => void;
    sendToHost: (channel: string, arguments?: {}) => void;
    removeListener: (channel: string, listener: Function) => void;
    removeAllListeners: (channel?: string) => void;
    listenerCount: (channel?: string) => number;
  }
}
