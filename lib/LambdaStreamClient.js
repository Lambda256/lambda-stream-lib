'use strict';

const WebSocket = require('ws');
const EventEmitter = require('events');
const delay = require('delay');

class LambdaStreamClient extends EventEmitter {
    constructor(endPoint, lChainId, authorization, filters) {
        super();

        this.endPoint = endPoint;
        this.lChainId = lChainId;
        this.authorization = authorization;
        this.filters = filters;

        this.wsClient = null;
        this.readyState = 'INIT';
    }

    init() {

    }

    async onOpen() {
        this.emit('open');
    }

    async onMessage(data) {
        this.emit('message', data);
    }

    async onClose() {
        console.info(`close`);
        await delay(1000);
        this.connect();
    }

    async onError(err) {
        this.emit('error', err);
    }

    async connect() {
        this.readyState = 'CONNECTING';

        return new Promise((resolve, reject) => {
            this.wsClient = new WebSocket(this.endPoint);

            const self = this;

            this.wsClient.on('message', async function incoming(message) {
                await this.self.onMessage(message);
            }.bind({self: self}));

            this.wsClient.on('open', async function open() {
                this.readyState = 'CONNECTED';
                await this.self.onOpen();
                resolve(true);

            }.bind({self: self}));

            this.wsClient.on('close', async function close() {
                await this.self.onClose();
            }.bind({self: self}));

            this.wsClient.on('error', async function error(err) {
                await this.self.onError(err);

                if ('CONNECTING' === this.readyState) {
                    reject(err);
                }
            }.bind({self: self}));
        });
    }

    async start() {
        let message = {
            version: "v1.0",
            data: {
                type: 'start'
            }
        };

        this.wsClient.send(JSON.stringify(message));
    }

    async stop() {
        let message = {
            version: "v1.0",
            data: {
                type: 'stop'
            }
        };

        this.wsClient.send(JSON.stringify(message));
    }

    async commit(offset) {
        let message = {
            version: "v1.0",
            data: {
                type: 'commit',
                value: offset
            }
        };

        this.wsClient.send(JSON.stringify(message));
    }

    async close() {
        let message = {
            version: "v1.0",
            data: {
                type: 'close'
            }
        };

        this.wsClient.send(JSON.stringify(message));
    }
}

module.exports = LambdaStreamClient;