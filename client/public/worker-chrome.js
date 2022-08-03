/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import init, { contribute, initThreadPool } from "./pkg-chrome/small_pot.js";
//import { parentPort } from 'worker_threads';

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
    console.debug(`compute starting, params: ${sourceParams.length} ${g1Points}`);
    const result = contribute(sourceParams, g1Points, g2Points /*, setHash*/);
    console.debug(`contribute done ${result.length}`);
    const message = {
        error: false,
        type: 'COMPLETE',
        result: result.buffer
    };
    postMessage(message, [result.buffer]);
  } catch (err) {
    console.error('Error in compute: ' + err);
    postMessage(
      JSON.stringify({
        error: true,
        type: 'ERROR',
        message: err.message,
      }),
    );
  }
}

onmessage = (event) =>  {
  console.debug(`message event: ${JSON.stringify(event.data)} TYPE:${event.data.type}`);
  if (event.data && event.data.type === 'LOAD_PARAMS') {
    //const wasm = import('phase2');
    //setWasm(wasm);
  };

  if (event.data && event.data.type === 'LOAD_WASM') {
    console.debug(`service-worker: LOAD_WASM ${event}`);
    load().then(() => {
      postMessage({ type: 'LOADED' });
    });
  };

  if (event.data && event.data.type === 'COMPUTE') {
    console.debug(`service-worker: COMPUTE ${JSON.stringify(event.data)}`);

    const sourceParams = new Uint8Array(event.data.params);
    const g1Points = 2**16;
    let g2Points = 2;
    try {
      compute(sourceParams, g1Points, g2Points);
    } catch (err) {
      console.error(`Error in compute(): ${err.message}`);
    }
  };
};

postMessage({ type: 'ONLINE' });
console.debug('worker.js online');