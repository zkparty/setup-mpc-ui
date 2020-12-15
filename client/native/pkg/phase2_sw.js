/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */
import { contribute } from './phase2';

//declare const self: ServiceWorkerGlobalScope;
console.debug('webworker');

self.addEventListener('message', async (event) => {
    console.debug(`message event: ${JSON.stringify(event.data)} TYPE:${event.data.type}`);
    if (event.data && event.data.type === 'LOAD_PARAMS') {
      console.debug(`LOAD_PARAMS in service-worker`);
  
      //const wasm = import('phase2');
      //setWasm(wasm);
    };
  
    if (event.data && event.data.type === 'LOAD_WASM') {
      console.debug(`LOAD_WASM in service-worker`);
  
      // interface Phase2 {
      //   contribute: ((a: Uint8Array) => any);
      // }
  
      //.then(
        //async ({ contribute }) => {
          //wasm.init();
          //const module = await WebAssembly.compileStreaming(wasm);
          //console.log('instantiate');
          //const instance = await WebAssembly.instantiate(module);
          //const p: any = wasm.exports;
          
          console.log('load params');
          let paramData = await fetch('/zk_transaction_1_2.params');
          paramData =  paramData.arrayBuffer();
          paramData = new Uint8Array(paramData);
          console.log('Source params', paramData);
          //console.log(`phase2  ${wasm.contribute} `);
          const result = contribute(paramData, new Uint8Array(64), reportProgress, setHash);
          //wasm = import('phase2');
          console.log('WASM module loaded');
        //});
    };
  
  });
  
  const reportProgress = () => {};
  
  const setHash = (h) => {
      console.log(`hash ${h}`);
  };