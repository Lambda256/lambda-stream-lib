'use strict';

const WebSocket = require('ws');
const EventEmitter = require('events');
const MessageHelper = require('./MessageHelper');

const CLIENT_STATUS = require('./Constants').CLIENT_STATUS;
const MESSAGE_TYPE = require('./Constants').MESSAGE_TYPE;


class LambdaStreamClient extends EventEmitter {
    constructor(endPoint, lChainId, accessKey) {
        super();

        this.endPoint = endPoint;
        this.lChainId = lChainId;
        this.accessKey = accessKey;

        this.wsClient = null;

        this.clientStatus = CLIENT_STATUS.NONE;
        this.isNeedReconnect = false;

        this.processMutex = false;
    }

    changeClientStatus(toStatus) {
        this.clientStatus = toStatus;
    }

    async start() {
        this.changeClientStatus(CLIENT_STATUS.START);

        if (!this.processTimer) {
            const self = this;
            this.processTimer = setInterval(async function () {
                if (true === self.processMutex) {
                    return;
                }
                self.processMutex = true;

                try {
                    await self.process();
                } catch (err) {
                    console.error(err);
                }

                self.processMutex = false;
            }, 3000);
        }
    }

    async close() {
        this.changeClientStatus(CLIENT_STATUS.CLOSE);
    }

    async process() {
        if (true === this.isNeedReconnect) {

            this.changeClientStatus(CLIENT_STATUS.CONNECTING);
            await this.connect();

        } else if (CLIENT_STATUS.START === this.clientStatus) {
            this.changeClientStatus(CLIENT_STATUS.CONNECTING);
            await this.connect();

        } else if (CLIENT_STATUS.CONNECTED === this.clientStatus) {

            this.changeClientStatus(CLIENT_STATUS.STARTING);
            await MessageHelper.sendStartMessage(this.wsClient);

        } else if (CLIENT_STATUS.PAUSE === this.clientStatus) {

            await this.changeClientStatus(CLIENT_STATUS.PAUSING);
            await MessageHelper.sendPauseMessage(this.wsClient);

        } else if (CLIENT_STATUS.RESUME === this.clientStatus) {

            this.changeClientStatus(CLIENT_STATUS.RESUMING);
            await MessageHelper.sendResumeMessage(this.wsClient);

        } else if (CLIENT_STATUS.CLOSE === this.clientStatus) {

            this.changeClientStatus(CLIENT_STATUS.CLOSING);
            await MessageHelper.sendCloseMessage(this.wsClient);
        }
    }

    async onOpen() {
        this.changeClientStatus(CLIENT_STATUS.CONNECTED);
        this.isNeedReconnect = false;
        this.emit('open');
    }

    async onMessage(data) {
        try {
            let object = JSON.parse(data);
            let type = true === Array.isArray(object) ? object[0].data.type : object.data.type;

            if (false === MESSAGE_TYPE.isDefined(type)) {
                throw new Error(`undefined msg type : ${type}`);
            }

            if (true === CLIENT_STATUS.isDefined(type)) {
                this.changeClientStatus(CLIENT_STATUS.get(type));
            }

            this.emit(type, object);
        } catch (err) {
            console.error(err);
        }
    }

    async onClose() {
        if (CLIENT_STATUS.CLOSED === this.clientStatus) {
            //beautiful closed.
            console.info('close successful')
        } else {
            if (this.clientStatus.key.startsWith('PAUS') || this.clientStatus.key.startsWith('CLOS')) {
                this.changeClientStatus(CLIENT_STATUS.CLOSED);
            } else {
                this.isNeedReconnect = true;
                console.info('abnormal closed, try reconnect');
            }
        }
        this.emit('close');
    }

    async onError(err) {
        this.emit('error', err);
    }

    async connect() {
        let options = {
            headers: {
                lChainId: this.lChainId,
                accessKey: this.accessKey
            }
        };
        /////////////////////////////

        this.wsClient = new WebSocket(this.endPoint, null, options);

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


    async resume() {
        let toState = CLIENT_STATUS.RESUME;
        this.clientStatus = toState;
    }

    async pause() {
        let toState = CLIENT_STATUS.PAUSE;

        this.clientStatus = toState;
    }

    async commit(offset){
        await MessageHelper.sendCommit(this.wsClient, offset);
    }

    async rollback(offset) {
        await MessageHelper.sendRollback(this.wsClient, offset);
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






}

module.exports = LambdaStreamClient;