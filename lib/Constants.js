const Enum = require('enum');

const CLIENT_STATUS = new Enum(['NONE', 'START', 'STARTING', 'STARTED',
    'CONNECTING', 'CONNECTED', 'PAUSE', 'PAUSING', 'PAUSED',
    'RESUME', 'RESUMING', 'CLOSE', 'CLOSING', 'CLOSED'], {
    freez: true,
    name: 'CLIENT_STATUS'
});

const MESSAGE_TYPE = new Enum(['START', 'STARTING', 'STARTED',
    'CONNECTING', 'CONNECTED', 'PAUSE', 'PAUSING', 'PAUSED',
    'RESUME', 'RESUMING', 'RESUMED', 'CLOSE', 'CLOSING', 'CLOSED', 'RECEIPT', 'COMMITTED' ,'ERROR'], {
    freez: true,
    name: 'MESSAGE_TYPE'
});

module.exports ={
    CLIENT_STATUS,
    MESSAGE_TYPE
};