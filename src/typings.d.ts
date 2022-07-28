/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

// TODO: maybe move into ipc.types ?

interface Window {
  electronAPI: {
    electron: boolean;
    send: (channel: string, arguments?: {}) => void;
    sendAndWait: <T>(channel: string, replyChannel: string, ...args: any[]) => T;
    listen: (channel: string, callback: Function) => void;
    removeListener: (channel: string) => void;
  }
}
