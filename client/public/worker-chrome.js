/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import init, { contribute, initThreadPool } from "./pkg-chrome/small_pot.js";
//import { parentPort } from 'worker_threads';

console.log(`worker.js isolated? ${self.crossOriginIsolated}`);

postMessage({ type: 'start' });

//self.importScripts('./pkg/small_pot.js');

// @ts-ignore
//const { contribute } = wasm_bindgen;
//let sourceParams = new Uint8Array();
//let client;
async function load() {
  // @ts-ignore
  //await wasm_bindgen('./pkg/small_pot_bg.wasm');
  await init();
  await initThreadPool(navigator.hardwareConcurrency);

  // let data = await fetch('./zk_transaction_1_2.params');
  // let data2 = await data.arrayBuffer()
  // sourceParams = new Uint8Array(data2);
  console.debug('wasm module loaded');
}

function compute(sourceParams, g1Points, g2Points) {
  try {
    console.debug(`compute starting. params: ${sourceParams.length} ${g1Points}`);
    const result = contribute(sourceParams, g1Points, g2Points /*, setHash*/);
    console.debug(`contribute done ${result.length}`);
    const message = {
        error: false,
        type: 'COMPLETE',
        result: result.buffer
    };
    postMessage(message, [result.buffer]);
  } catch (err) {
    console.log(`Error in compute: ${JSON.stringify(err)}`);
    postMessage(
      JSON.stringify({
        error: true,
        type: 'ERROR',
        message: err.message,
      }),
    );
  }
}

// const setHash = (h) => {
//   console.debug(`hash ${h}`);
//   postMessage(
//     JSON.stringify({
//         error: false,
//         type: 'HASH',
//         hash: h
//     }),
//   );
// };

// const reportProgress = (count, total) => {
//   //console.debug(`sw progress: ${count} of ${total}`);
//   postMessage(
//         JSON.stringify({
//             error: false,
//             type: 'PROGRESS',
//             count: count,
//             total: total
//         }));
// };

onmessage = (event) =>  {
  console.log(`message event: ${JSON.stringify(event.data)} TYPE:${event.data.type}`);
  if (event.data && event.data.type === 'LOAD_PARAMS') {
    console.log(`LOAD_PARAMS in service-worker`);



    //const wasm = import('phase2');
    //setWasm(wasm);
  };

  if (event.data && event.data.type === 'LOAD_WASM') {
    console.log(`LOAD_WASM in service-worker ${event}`);
    load().then(() => {
      postMessage({ type: 'LOADED' });
      console.log('loaded')
    });
  };

  if (event.data && event.data.type === 'COMPUTE') {
    console.log(`COMPUTE in service-worker ${JSON.stringify(event.data)}`);

    const sourceParams = new Uint8Array(event.data.params);
    const g1Points = 2**16;
    let g2Points = 2;
    console.debug(`lengths: ${sourceParams.length}`);
    try {
      compute(sourceParams, g1Points, g2Points);
    } catch (err) {
      console.error(`Error in compute(): ${err.message}`);
    }
  };
};

postMessage({ type: 'ONLINE' });
console.debug('worker.js online');