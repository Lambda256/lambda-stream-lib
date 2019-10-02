const LambdaStreamClient = require('./../index');

async function test() {
    const endPoint = 'ws://127.0.0.1:10090';
    const lChainId = '6555545119154595912';

    //authorization == groupId
    //const authorization = 'test' + 'nus';
    const authorization = 'test' + new Date().getTime();

    try {
        let streamClient = new LambdaStreamClient(endPoint, lChainId, authorization);

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
        /*
        streamClient.on('message', async function message(msg) {
            console.info(`[out side] message: ${msg}`);
            let obj = JSON.parse(msg);
            await streamClient.commit(obj.offset);
        });
        */
        /////////////////////


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
        }, 1000 * 20);

        /*
                setTimeout(async function close() {
                    //    await streamClient.close();
                }, 15000);
          */

    } catch (err) {
        console.error(err);
    }
}

test().then();