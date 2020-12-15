/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
//import init, { contribute } from "./pkg/phase2/phase2.js";

declare const self: ServiceWorkerGlobalScope;

self.importScripts('./pkg/phase2/phase2.js');

// @ts-ignore
const { contribute } = wasm_bindgen;
async function run() {
  // @ts-ignore
  await wasm_bindgen('./pkg/phase2/phase2_bg.wasm');

  let data = await fetch('./zk_transaction_1_2.params');
  let data2 = await data.arrayBuffer()
  let data3 = new Uint8Array(data2)
  const result = contribute(data3, new Uint8Array(64), reportProgress, setHash);
  console.log('contribute done');
}

const setHash = (h: string) => {
  console.log(`hash ${h}`);
};
const reportProgress = (a: number, b: number) => {
  console.log(`sw progress: ${a} of ${b}`);
  // window.top.postMessage(
  //     JSON.stringify({
  //         error: false,
  //         message: `progress: ${a} of ${b}`
  //     }),
  //     '*'
  // );
};


clientsClaim();

// Precache all of the assets generated by your build process.
// Their URLs are injected into the manifest variable below.
// This variable must be present somewhere in your service worker file,
// even if you decide not to use precaching. See https://cra.link/PWA
precacheAndRoute(self.__WB_MANIFEST);

// Set up App Shell-style routing, so that all navigation requests
// are fulfilled with your index.html shell. Learn more at
// https://developers.google.com/web/fundamentals/architecture/app-shell
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  // Return false to exempt requests from being fulfilled by index.html.
  ({ request, url }: { request: Request; url: URL }) => {
    // If this isn't a navigation, skip.
    if (request.mode !== 'navigate') {
      return false;
    }

    // If this is a URL that starts with /_, skip.
    if (url.pathname.startsWith('/_')) {
      return false;
    }

    // If this looks like a URL for a resource, because it contains
    // a file extension, skip.
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }

    // Return true to signal that we want to use the handler.
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// An example runtime caching route for requests that aren't handled by the
// precache, in this case same-origin .png requests like those from in public/
registerRoute(
  // Add in any other file extensions or routing criteria as needed.
  ({ url }) => url.origin === self.location.origin && url.pathname.endsWith('.png'),
  // Customize this strategy as needed, e.g., by changing to CacheFirst.
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      // Ensure that once this runtime cache reaches a maximum size the
      // least-recently used images are removed.
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
  //console.log(`message event: ${event.data} type ${event.data.type}`);
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});



// Any other custom service worker logic can go here.
self.addEventListener('message', async (event) => {
  console.log(`message event: ${JSON.stringify(event.data)} TYPE:${event.data.type}`);
  if (event.data && event.data.type === 'LOAD_PARAMS') {
    console.log(`LOAD_PARAMS in service-worker`);

    //const wasm = import('phase2');
    //setWasm(wasm);
  };

  if (event.data && event.data.type === 'LOAD_WASM') {
    console.log(`LOAD_WASM in service-worker`);

    // interface Phase2 {
    //   contribute: ((a: Uint8Array) => any);
    // }

    //const { contribute } = await import('phase2')
    //.then(
      //async ({ contribute }) => {
        //wasm.init();
        //const module = await WebAssembly.compileStreaming(wasm);
        //console.log('instantiate');
        //const instance = await WebAssembly.instantiate(module);
        //const p: any = wasm.exports;
        
        // console.log('load params');
        // let paramData: any = await fetch('/zk_transaction_1_2.params');
        // paramData =  paramData.arrayBuffer();
        // paramData = new Uint8Array(paramData);
        // console.log('Source params', paramData);
        // //console.log(`phase2  ${wasm.contribute} `);
        // const result = contribute(paramData, new Uint8Array(64), reportProgress, setHash);
        // //wasm = import('phase2');
        // console.log('WASM module loaded');
      //});

      run();
  };

});
