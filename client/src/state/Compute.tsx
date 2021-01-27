import * as React from 'react';
import { getParamsFile, uploadParams } from "../api/FileApi";
import { Ceremony } from "../types/ceremony";

import { createGist } from "../api/ZKPartyApi";
import { Dispatch, useContext } from "react";
import { ComputeDispatchContext } from './ComputeStateManager';

//let worker: Worker | null = null;

export const startWorkerThread = (dispatch: React.Dispatch<any>) => {
    //const dispatch = useContext(ComputeDispatchContext);

    if (!dispatch) return;

    const worker = new window.Worker('./worker.js');
    console.debug('worker thread started');
    //worker.onmessage = (e) => ('online', loadWasm);
    worker.onmessage = (event) => {
        //console.log('message from worker:', event);
        const data = (typeof event.data === 'string') ?
        JSON.parse(event.data)
        : event.data;
      switch (data.type) {
        case 'ONLINE': {
            worker.postMessage({type: 'LOAD_WASM'});
            break;
        }
        case 'PROGRESS': {
            //console.log(`message from service worker ${message}`);
            
            dispatch({
                type: 'PROGRESS_UPDATE',
                data: data.total > 0 ? 100 * data.count / data.total : 0,
            })
            break;
        }
        case 'HASH': { 
            dispatch({type: 'SET_HASH', hash: data.hash});
            break; 
        }
        case 'COMPLETE': { 
            const result = new Uint8Array(data.result);
            console.debug(`COMPLETE ${result.length}`);
            dispatch({type: 'COMPUTE_DONE', newParams: result, dispatch });
            break; 
        }
        case 'ERROR': {
            console.log(`Error while computing. ${JSON.stringify(data)}`);
        }
      }
    };

    dispatch({ type: 'SET_WORKER', data: worker });
};

// export const loadWasm = async () => {
//     if (worker) {
//         worker.postMessage({type: 'LOAD_WASM'});
//     }

//     //if (navigator.serviceWorker.controller) {
//     //    navigator.serviceWorker.controller.postMessage({type: 'LOAD_WASM'});
//     //    console.debug('service worker initialised');
//     //} else {
//     //    console.log('Do not have controller!');
//     //}
// };

export const startDownload = (ceremonyId: string, index: number, dispatch: Dispatch<any>) => {
    //const dispatch = useContext(ComputeDispatchContext);

    // DATA DOWNLOAD
    console.debug(`getting data ${ceremonyId} ${index}`);
    getParamsFile(ceremonyId, index).then( paramData => {
        console.debug(`downloaded ${paramData?.length}`);
        dispatch({
            type: 'DOWNLOADED',
            data: paramData,
        });
    }).catch(err => 
        {console.error(err.message);}
    );
};

export const startComputation = (params: Uint8Array, entropy: Uint8Array, worker: Worker) => {
    //const newParams = wasm.contribute(params, entropy, reportProgress, setHash);
    console.log(`params ${params.buffer.byteLength} ${entropy.buffer.byteLength}`);
    const message = {
        type: 'COMPUTE', 
        params: params.buffer,
        entropy: entropy.buffer,
    };
    worker.postMessage(message,
    [
        params.buffer,
        entropy.buffer
    ]);
};

export const startUpload = (ceremonyId: string, index: number, data: Uint8Array, dispatch: Dispatch<any>) => {
    uploadParams(
        ceremonyId, 
        index, 
        data, 
        (progress) => dispatch({type: 'PROGRESS_UPDATE', data: progress})
    ).then(
        paramsFile => {
            dispatch({
                type: 'UPLOADED',
                file: paramsFile,
                dispatch,
            })
    });
}

export const startCreateGist = (ceremony: Ceremony, index: number, hash: string, accessToken: string, dispatch: Dispatch<any>) => {
    console.debug(`startCreateGist ${accessToken}`);
    if (accessToken) {
        createGist(ceremony.id, ceremony.title, index, hash, accessToken).then(
            gistUrl => {
                dispatch({
                    type: 'GIST_CREATED',
                    gistUrl,
                })
        });
    } else {
        dispatch({
            type: 'GIST_CREATED',
            gistUrl: null,
        })
    }
}
