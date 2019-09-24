const LambdaStreamClient = require('./../index');

async function test() {
    const endPoint = 'ws://127.0.0.1:10090';
    const lChainId = '12345';
    const authorization = 'UXp9yJGecDJyjw5em6vsfhKCoGssKSqMZWaTDfWJ34Xvwas7Qv4F98zia4i9gbnV';

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
        streamClient.on('started', async function started() {
            console.info('[out side] started');
        });

        streamClient.on('paused', async function paused() {
            console.info('[out side] paused');
        });

        streamClient.on('resumed', async function paused() {
            console.info('[out side] resumed');
        });

        streamClient.on('closed', async function paused() {
            console.info('[out side] closed');
        });

        streamClient.on('receipt', async function receipt(msg) {
            console.info(`[out side] receipt: ${msg}`);
        });


        /////////////////////////////////////////////

        await streamClient.start();
/*
        setTimeout(async function pause() {
            await streamClient.pause();
        }, 5000);

        setTimeout(async function resume() {
            await streamClient.resume();
        }, 10000);


        setTimeout(async function close() {
        //    await streamClient.close();
        }, 15000);
*/

    } catch (err) {
        console.error(err);
    }
}

test().then();