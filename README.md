# proxy-worker-controller
Simple and lightweight module to extend your node.js classes with multithreading functions

## Installation
To install the most recent release from npm, run:

```npm install talib-wasm --save```

## Examples
### Simple usage
example nodejs class file: 
```javascript
const ProxyWorkerController = require('proxy-worker-controller');

class ExampleProxyClass extends ProxyWorkerController {
    constructor(a, b) {
        // Insert this code to your class to use multithreading with workers
        // THIS CODE IS MANDATORY {
        const pwcResult = super(a, b);
        if (pwcResult && !(pwcResult instanceof ExampleProxyClass)) {
            return pwcResult;
        }
        // } 


        this.__a = a;
        this.__b = b;
    }

    method1(a) {
        console.log('called', 'method1', a);
        return this.__a;
    }

    method2(b) {
        console.log('called', 'method2', b);
        return this.__b;
    }
}

module.exports = ExampleProxyClass;
```
run code snippet:
```
npm run example-01
```
Output:
```
  proxy-worker-controller:main-thread sending message bb6650b0-c902-4caf-b2bd-c59260ad277d constructor [ 111, 222 ] +0ms
  proxy-worker-controller:main-thread sending message 451b0ea4-de54-4cfc-ad90-02c6b3d0d29a method1 [ 'a' ] +3ms
2020-01-29T10:07:46.746Z proxy-worker-controller:worker WORKER STARTED
2020-01-29T10:07:46.748Z proxy-worker-controller:worker CALLED METHOD {"method":"init","payload":{"parentPort":{"_events":{},"_eventsCount":2},"mainClassFilename":"/Users/user/Documents/own-projects/proxy-worker-controller/examples/01-example-call/example-proxy-class.js"}}
  proxy-worker-controller:main-thread resolved message 451b0ea4-de54-4cfc-ad90-02c6b3d0d29a 111 null +41ms
method1 111
  proxy-worker-controller:main-thread sending message e4edae4f-d02f-4dab-b952-622e3b713d77 method2 [ 'b' ] +1ms
2020-01-29T10:07:46.749Z proxy-worker-controller:worker CALLED METHOD {"uuid":"bb6650b0-c902-4caf-b2bd-c59260ad277d","method":"send","payload":{"property":"constructor","payload":[111,222]}}
2020-01-29T10:07:46.749Z proxy-worker-controller:worker CALLED METHOD {"uuid":"451b0ea4-de54-4cfc-ad90-02c6b3d0d29a","method":"send","payload":{"property":"method1","payload":["a"]}}
  proxy-worker-controller:main-thread resolved message e4edae4f-d02f-4dab-b952-622e3b713d77 222 null +0ms
method2 222
called method1 a
2020-01-29T10:07:46.750Z proxy-worker-controller:worker CALLED METHOD {"uuid":"e4edae4f-d02f-4dab-b952-622e3b713d77","method":"send","payload":{"property":"method2","payload":["b"]}}
called method2 b

```
## Methods
Worker instance makes all of class instance methods async. Use await to receive results.

### terminate()
Terminates worker instance. Use it to prevent CPU and Memory leaks.