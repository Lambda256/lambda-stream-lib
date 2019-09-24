'use strict';

const WebSocket = require('ws');
const EventEmitter = require('events');
const delay = require('delay');
const Enum = require('enum');

const CLIENT_STATUS = new Enum(['NONE', 'START', 'STARTING', 'STARTED',
    'CONNECTING', 'CONNECTED', 'PAUSE', 'PAUSING', 'PAUSED',
    'RESUME', 'RESUMING', 'CLOSE', 'CLOSING', 'CLOSED'], {freez: true, name: 'CLIENT_STATUS'});


class LambdaStreamClient extends EventEmitter {
    constructor(endPoint, lChainId, authorization, filters) {
        super();

        this.endPoint = endPoint;
        this.lChainId = lChainId;
        this.authorization = authorization;
        this.filters = filters;

        this.wsClient = null;
        //NONE, START, CONNECTING, CONNECTED, STARTING, STARTED, PAUSE, PAUSED, RESUME
        this.processStatus = CLIENT_STATUS.NONE;
        this.isNeedReconnect = true;

        this.processMutex = false;
    }

    init() {

    }

    async onOpen() {
        console.info('[inside] open');
        this.processStatus = CLIENT_STATUS.CONNECTED;

        this.emit('open');
    }

    async onMessage(data) {
        try {
            let object = JSON.parse(data);
            let type = object.data.type;

            if (false === CLIENT_STATUS.isDefined(type)) {
                throw new Error(`undefined msg type : ${type}`);
            }
            this.processStatus = CLIENT_STATUS.get(type);
            this.emit(type, object);
        } catch (err) {
            console.error(err);
        }
    }

    async onClose() {
        if (CLIENT_STATUS.CLOSED === this.processStatus) {
            console.info('close successful')
        } else {
            if (true === this.isNeedReconnect) {
                await delay(1000);
                console.info('try to reconnect!');
                this.processStatus = CLIENT_STATUS.CLOSED;
                await this.start();
            } else {
                this.processStatus = CLIENT_STATUS.CLOSED;
            }
        }
        this.emit('close');
    }

    async onError(err) {
        this.emit('error', err);
    }

    async connect() {
        this.wsClient = new WebSocket(this.endPoint);

        const self = this;

        this.wsClient.on('message', async function incoming(message) {
            await this.self.onMessage(message);
        }.bind({self: self}));

        this.wsClient.on('open', async function open() {
            await this.self.onOpen();
        }.bind({self: self}));

        this.wsClient.on('close', async function close() {
            await this.self.onClose();
        }.bind({self: self}));

        this.wsClient.on('error', async function error(err) {
            await this.self.onError(err);
        }.bind({self: self}));

    }


    async process() {
        if (true === this.processMutex) {
            return;
        }

        try {
            this.processMutex = true;

            if (CLIENT_STATUS.START === this.processStatus) {
                this.processStatus = CLIENT_STATUS.CONNECTING;
                await this.connect();
            } else if (CLIENT_STATUS.CONNECTED === this.processStatus) {
                this.processStatus = CLIENT_STATUS.STARTING;
                let message = {
                    version: "v1.0",
                    data: {
                        type: CLIENT_STATUS.START.key
                    }
                };

                this.wsClient.send(JSON.stringify(message));
            } else if (CLIENT_STATUS.PAUSE === this.processStatus) {
                this.processStatus = CLIENT_STATUS.PAUSING;
                let message = {
                    version: "v1.0",
                    data: {
                        type: CLIENT_STATUS.PAUSE.key
                    }
                };

                this.wsClient.send(JSON.stringify(message));
            } else if (CLIENT_STATUS.RESUME === this.processStatus) {
                this.processStatus = CLIENT_STATUS.RESUMING;
                let message = {
                    version: "v1.0",
                    data: {
                        type: CLIENT_STATUS.RESUME.key
                    }
                };

                this.wsClient.send(JSON.stringify(message));
            } else if (CLIENT_STATUS.CLOSE === this.processStatus) {
                this.processStatus = CLIENT_STATUS.CLOSING;
                let message = {
                    version: "v1.0",
                    data: {
                        type: CLIENT_STATUS.CLOSE.key
                    }
                };
                this.wsClient.send(JSON.stringify(message));
            }
        } catch (err) {
            console.error(err);
        } finally {
            this.processMutex = false;
        }
    }

    async start() {
        let toState = CLIENT_STATUS.START;
        this.stateValidation(toState);
        this.processStatus = toState;
        this.isNeedReconnect = true;

        if (!this.processTimer) {
            let self = this;
            this.processTimer = setInterval(async function () {
                await self.process();
            }, 1000, this);
        }
    }


    async resume() {
        let toState = CLIENT_STATUS.RESUME;
        this.stateValidation(toState);
        this.processStatus = toState;
        this.isNeedReconnect = true;
    }

    async pause() {
        let toState = CLIENT_STATUS.PAUSE;
        this.stateValidation(toState);
        this.processStatus = toState;
    }

    async close() {
        let toState = CLIENT_STATUS.CLOSE;
        this.stateValidation(toState);
        this.processStatus = toState;
    }

    async closeQuietly() {
        try {
            if (this.wsClient) {
                this.wsClient.terminate();
                this.wsClient = null;
            }
        } catch (err) {
            console.warn(err);
        }
    }


    stateValidation(toState) {
        if (CLIENT_STATUS.START === toState) {
            if (CLIENT_STATUS.NONE !== this.processStatus && CLIENT_STATUS.CLOSED !== this.processStatus) {
                throw new Error(`invalid state, currentState:${this.processStatus} -> toState:${toState}`);
            }
        } else if (CLIENT_STATUS.PAUSE === toState) {
            if (CLIENT_STATUS.STARTED !== this.processStatus) {
                throw new Error(`invalid state, currentState:${this.processStatus} -> toState:${toState}`);
            }
        } else if (CLIENT_STATUS.RESUME === toState) {
            if (CLIENT_STATUS.PAUSED !== this.processStatus) {
                throw new Error(`invalid state, currentState:${this.processStatus} -> toState:${toState}`);
            }
        } else if (CLIENT_STATUS.CLOSE === toState) {

        } else {
            throw new Error(`invalid state, currentState:${this.processStatus} -> toState:${toState}`);
        }

    }


    async commit(offset) {
        let message = {
            version: "v1.0",
            data: {
                type: 'COMMIT',
                value: offset
            }
        };

        this.wsClient.send(JSON.stringify(message));
    }

    async rollback(offset){
        let message = {
            version: "v1.0",
            data: {
                type: 'ROLLBACK',
                value: offset
            }
        };

        this.wsClient.send(JSON.stringify(message));
    }
}

module.exports = LambdaStreamClient;