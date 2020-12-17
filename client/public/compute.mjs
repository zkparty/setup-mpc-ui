    importScripts( "./pkg/phase2/phase2.js");
    const { add } = wasm_bindgen;

    async function run() {
        await wasm.init();
        console.log('run()');
        let data = await fetch('./zk_transaction_1_2.params');
        data = await data.arrayBuffer()
        data = new Uint8Array(data)
        const result = wasm.contribute(data, new Uint8Array(64), reportProgress, setHash);
        console.log('contribute done');
    };

    window.top.postMessage(
        JSON.stringify({
        error: false,
        message: "iframe started"
        }),
        '*'
    );

    const setHash = (h) => {
        console.log(`hash ${h}`);
    };
    const reportProgress = (a, b) => {
        console.log(`progress: ${a} of ${b}`);
        window.top.postMessage(
            JSON.stringify({
                error: false,
                message: `progress: ${a} of ${b}`
            }),
            '*'
        );
    };

    console.log('head');
    window.addEventListener("message", event => {
        console.log('event received in iframe ' + event.data);
        if (typeof event.data === 'string') {
        const request = JSON.parse(event.data).message;
        if (request === 'COMPUTE') {
            run();  
        };
        window.top.postMessage(
            JSON.stringify({
            error: false,
            message: "message received " + JSON.parse(event.data).message
            }),
            '*'
        );
        }
    });          
