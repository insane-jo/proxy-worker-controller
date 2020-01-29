const ExampleProxyClass = require('./example-proxy-class');

const epc = new ExampleProxyClass(111,222);

(async () => {
    console.log('method1', await epc.method1('a'));
    console.log('method2', await epc.method2('b'));

    epc.terminate();
})();