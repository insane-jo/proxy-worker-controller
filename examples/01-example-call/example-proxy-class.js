const ProxyWorkerController = require('../../index');

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