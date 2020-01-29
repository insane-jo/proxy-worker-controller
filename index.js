const {
    Worker, isMainThread, parentPort, MessageChannel
} = require('worker_threads');
const uuidGenerator = require('uuid/v4');
const debug = require('debug');

const debugError = debug(`proxy-worker-controller:${isMainThread ? 'main-thread' : 'worker'}`);
const debugOk = debug(`proxy-worker-controller:${isMainThread ? 'main-thread' : 'worker'}`);
debugOk.log
    = console.log;

if (isMainThread) {
    const deferred = require('./deferred');

    module.exports = class ProxyWorkerController {
        constructor(...constructorArguments) {
            const worker = new Worker(__filename);

            worker.on('error', (code) => {
                debugError('error', code);
            });

            worker.on('exit', (code) => {
                debugError('exit', code);
            });

            const subChannel = new MessageChannel();
            const MESSAGES_DEFERREDS = {};

            worker.send = (method = 'send', property, payload) => {
                const currentUuid = uuidGenerator();

                debugOk('sending message', currentUuid, property, payload);

                worker.postMessage({
                    uuid: currentUuid,
                    method,
                    payload: {
                        property, payload
                    }
                });

                const currentDeferred = deferred();
                MESSAGES_DEFERREDS[currentUuid] = currentDeferred;

                return currentDeferred.promise;
            };

            subChannel.port2.on('message', ({uuid, result, error}) => {
                const deferred = MESSAGES_DEFERREDS[uuid];
                if (error) {
                    debugError('rejected message', uuid, result, error);
                    deferred.reject(error);
                } else {
                    debugOk('resolved message', uuid, result, error);
                    deferred.resolve(result);
                }

                delete MESSAGES_DEFERREDS[uuid];
            });

            worker.postMessage({
                method: 'init',
                payload: {
                    parentPort: subChannel.port1,
                    mainClassFilename: module.parent.filename
                }
            }, [subChannel.port1]);

            worker.send('send', 'constructor', constructorArguments);

            return new Proxy({}, {
                get(target, property) {
                    if (property === 'terminate') {
                        return () => {
                            return worker.terminate();
                        }
                    }
                    return (...args) => {
                        return worker.send('send', property, args);
                    }
                }
            });
        }
    }
} else {
    let portForMessaging;
    let MainClass;
    let mainClassInstance;

    debugOk('WORKER STARTED');

    module.exports = class DummyProxyWorkerController {
        constructor() {
            return null
        }
    };

    parentPort.on('message', async (args) => {
        debugOk('CALLED METHOD', JSON.stringify(args));
        const {uuid, method, payload} = args;

        if (method === 'init') {
            portForMessaging = payload.parentPort;

            MainClass = require(payload.mainClassFilename);
        } else {
            const methodToCall = payload.property;
            const methodPayload = payload.payload;
            if (methodToCall === 'constructor') {
                mainClassInstance = new MainClass(...methodPayload);
            } else {
                try {
                    const callResult = await mainClassInstance[methodToCall](...methodPayload);
                    portForMessaging.postMessage({
                        uuid,
                        result: callResult,
                        error: null
                    });
                } catch(err) {
                    portForMessaging.postMessage({
                        uuid,
                        error: err
                    });
                }
            }
        }
    });
}
