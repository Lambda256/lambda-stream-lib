# lambda-stream-lib
=================
 lambda-stream-lib is JavaScript API library that allows developers to interact with a
Luniverse Transaction Listener Service using as WebSocket connection.

Table of contents
=================
   * [Requirements](#Requirements)
   * [Installation](#Installation)
   * [Environment](#Environment)
      * [EndPoint](#EndPoint)
   * [Getting Started](#Getting-Started)
      * [Example](#Subscribe-Receipt)

Requirements
=================
The following packages are required to use the lambda-stream-lib library.
- [Node.js](https://nodejs.org/en/download/)
- [npm](https://www.npmjs.com/get-npm)

**Note** lambda-stream-lib can run on Node.js versions 8 and 10, and the recommended versions are:
- lts/carbon ([8.16.0](https://nodejs.org/dist/latest-v8.x/))
- lts/dubnium ([10.16.0](https://nodejs.org/dist/latest-v10.x/))

If you are already using a different version of the node(for example, node v12), use the Node Version Manager([NVM](https://github.com/nvm-sh/nvm)) to install and use the version supported by lambda-stream-lib.


Installation
=================
To try it out, install lambda-stream-lib with npm like following command:

```
$ npm install lambda-stream-lib
```

**Note** `package.json` file should exist on the same install path.  If it
does not exist, `package.json` should be generated via `npm init`.

To install a specific version of lambda-stream-lib, try the following command:
```
$ npm install lambda-stream-lib@X.X.X
```

Environment
=================

## EndPoint

```
 Production: `Comming Soon`
```
      
      
Getting-Started
=================

## Receive-Receipt
 lambda-stream-lib is designed to be the simplest way possible to receive receipt. 

```js
const LambdaStreamClient = require('lambda-stream-lib');

    const endPoint = '#insert endPoint#';
    const lChainId = `#insert lChainId#`;
    const accessKey = '#insert streamAccessKey#';

    try {
        let streamClient = new LambdaStreamClient(endPoint, lChainId, accessKey);

        streamClient.on('RECEIPT', async function message(messages) {
            for (let message of messages) {
                console.info(JSON.stringify(message));
            }

            let lastOffset = Number(messages[messages.length - 1].data.offset) + 1;

            await streamClient.commit(lastOffset);
        });

        streamClient.on('ERROR', async function message(message) {
            console.info(JSON.stringify(message));
        });

        await streamClient.start();
    } catch (err) {
        console.error(err);
    }
```