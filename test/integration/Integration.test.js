const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const assert = require('assert');
const expect = chai.expect;
const delay = require('delay');

const LambdaStreamClient = require('./../../index');

describe('AllInOne', function () {
        before(async function () {

        });
        after(() => {
            sinon.restore();
        });

        describe('[valid] integration all in one', () => {
            it('', async () => {
                const endPoint = 'ws://127.0.0.1:10090';
                const lChainId = '6555545119154595912';

                //accessKey == groupId
                //const accessKey = 'test' + 'nus';
                const accessKey = 'test' + new Date().getTime();

                let streamClient = new LambdaStreamClient(endPoint, lChainId, accessKey);

                //native socket event
                streamClient.on('open', async function open() {
                    console.info('[out side] open');
                });

                streamClient.on('close', async function close() {
                    console.info('[out side] close');
                });
                streamClient.on('error', async function error(err) {
                    console.info('[out side] error', err);
                });


                //message event
                streamClient.on('STARTED', async function started() {
                    console.info('[out side] started');
                });

                streamClient.on('PAUSED', async function paused() {
                    console.info('[out side] paused');
                });

                streamClient.on('RESUMED', async function paused() {
                    console.info('[out side] resumed');
                });

                streamClient.on('CLOSED', async function paused() {
                    console.info('[out side] closed');
                });

                streamClient.on('COMMITTED', async function committed() {
                    console.info('[out side] committed');
                });

                streamClient.on('RECEIPT', async function message(messages) {
                    //console.info(`[out side] : ${messages}`);
                    console.info(`[out side] receipt, size: ${messages.length}, ${messages[0].data.offset} - ${messages[messages.length - 1].data.offset}`);

                    let lastOffset = messages[messages.length - 1].data.offset;

                    await streamClient.commit(lastOffset);
                    await streamClient.pause();
                });


                /////////////////////////////////////////////

                await streamClient.start();


                setInterval(async function () {
                    await streamClient.resume();
                }, 1000 * 15);


                setTimeout(async function close() {
                    await streamClient.close();

                }, 1000 * 20);


                await delay(1000 * 60);
                process.exit(0);
            });
        });
    }
);