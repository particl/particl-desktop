const { EventEmitter } = require("events");


module.exports = class CoreInstance extends EventEmitter {


    constructor() {
        super();
    }


    async initialize() {
        throw new Error('NOT IMPLEMENTED');
    }


    async start() {
        throw new Error('NOT IMPLEMENTED');
    }


    async stop() {
        throw new Error('NOT IMPLEMENTED');
    }


    getSettings() {
        return { schema: {}, values: {} };
    }


    updateSettings(changedSettings) {
        return false;
    }

    listListeners() {
        return [];
    }
}
