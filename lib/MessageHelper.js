'use strict';

const WebSocket = require('ws');

const CLIENT_STATUS = require('./Constants').CLIENT_STATUS;
const MESSAGE_TYPE = require('./Constants').MESSAGE_TYPE;

async function sendStartMessage(wsClient) {
    let message = {
        version: "v1.0",
        data: {
            type: CLIENT_STATUS.START.key
        }
    };
    wsClient.send(JSON.stringify(message));
}

async function sendPauseMessage(wsClient) {
    let message = {
        version: "v1.0",
        data: {
            type: CLIENT_STATUS.PAUSE.key
        }
    };
    wsClient.send(JSON.stringify(message));
}

async function sendResumeMessage(wsClient) {
    let message = {
        version: "v1.0",
        data: {
            type: CLIENT_STATUS.RESUME.key
        }
    };
    wsClient.send(JSON.stringify(message));
}

async function sendCloseMessage(wsClient) {
    let message = {
        version: "v1.0",
        data: {
            type: CLIENT_STATUS.CLOSE.key
        }
    };
    wsClient.send(JSON.stringify(message));
}


async function sendCommit(wsClient, offset) {
    let message = {
        version: "v1.0",
        data: {
            type: 'COMMIT',
            value: offset
        }
    };

    wsClient.send(JSON.stringify(message));
}

async function sendRollback(wsClient, offset) {
    let message = {
        version: "v1.0",
        data: {
            type: 'ROLLBACK',
            value: offset
        }
    };

    wsClient.send(JSON.stringify(message));
}

module.exports = {
    sendStartMessage,
    sendPauseMessage,
    sendResumeMessage,
    sendCloseMessage,
    sendCommit,
    sendRollback
}