import * as React from 'react';
import { getParamsFile, uploadParams } from "../api/FileApi";
import { Ceremony, Project } from "../types/ceremony";

import { Dispatch } from "react";
import { getParticipantContributions } from '../api/FirestoreApi';
//import { zKey, powersOfTau } from 'snarkjs';

export const startDownload = (ceremonyId: string, index: number, prefix: string, suffix: string, dispatch: Dispatch<any>) => {
    // DATA DOWNLOAD
    console.debug(`getting data ${ceremonyId} ${index}`);
    const progressCb = (progress: number) => dispatch({type: 'PROGRESS_UPDATE', data: progress})
    getParamsFile(ceremonyId, index, prefix, suffix, progressCb).then( paramData => {
        //setTimeout(() => {
            console.debug(`downloaded ${paramData?.length}`);
            dispatch({
                type: 'DOWNLOADED',
                ceremonyId,
                data: paramData,
                dispatch,
            });
        //}, 500);
    }).catch(err => {
         console.error(`Error: ${err.message}. Skipping circuit`);
         // Failed download - abort and invalidate the contribution
         dispatch({type: 'ABORT_CIRCUIT', data: err.message, dispatch});
    });
};
enum ComputeMode { 
    ZKEY,
    POWERSOFTAU,
  };
  

const PROGRESS_UPDATE = 'PROGRESS_UPDATE';
export const startComputation = (params: Uint8Array, entropy: Uint8Array, participant: string, 
    dispatch: Dispatch<any>, worker: Worker) => {

    const progressOptions = {
        progressCallback: (val: number, total: number) => {
            //console.debug(`compute progress = ${val} of ${total}`);
            dispatch({
                type: PROGRESS_UPDATE,
                data: total > 0 ? 100 * val / total : 0,
            })
        }
    }
    const inputFd = { type: 'mem', data: params }; 
    let outFd =  { type: 'mem', data: new Uint8Array() }; 

    const handleResult = (hash: any) => {
        console.log(`contribution hash: ${JSON.stringify(hash)}`);
        dispatch({type: 'SET_HASH', hash});
        const result = outFd.data;
        console.debug(`COMPLETE ${result.length}`);
        dispatch({type: 'COMPUTE_DONE', newParams: result, dispatch });
    }

    try {
        console.log(`params ${params.buffer.byteLength} ${entropy.buffer.byteLength}`);
        const message = {
            type: 'COMPUTE', 
            params: params.buffer
        };
        worker.postMessage(message,
            [
                params.buffer
            ]);
        /*zKey.contribute( inputFd, outFd, 
                participant, entropy.buffer, console, progressOptions).then( */
          /*          (hash: any) => {
                        console.log(`contribution hash: ${JSON.stringify(hash)}`);
                        dispatch({type: 'SET_HASH', hash});
                        const result = outFd.data;
                        console.debug(`COMPLETE ${result.length}`);
                        dispatch({type: 'COMPUTE_DONE', newParams: result, dispatch });
                }); */
    } catch (err) {
        console.error(`Error in contribute: ${err}`);
    }
};

export const startUpload = (ceremonyId: string, index: number, prefix: string, suffix: string, data: Uint8Array, dispatch: Dispatch<any>) => {
    uploadParams(
        ceremonyId, 
        index,
        prefix, suffix, 
        data, 
        (progress) => dispatch({type: PROGRESS_UPDATE, data: progress})
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
    
    dispatch({
        type: 'CREATE_SUMMARY',
        gistUrl: null,
        dispatch,
    });
    //}
}

// All processing for the circuit has completed. 
export const endOfCircuit = ( participantId: string, dispatch: Dispatch<any>, isCoordinator: boolean = false) => {
    console.debug(`endOfCircuit`);
    if (dispatch) {
        //getContributions(participantId, dispatch, isCoordinator);
        dispatch({
            type: 'END_OF_CIRCUIT',
            dispatch,
        })
    }
}

export const getContributions = (project: Project, participantId: string, dispatch: Dispatch<any>, isCoordinator: boolean = false) => {
    console.debug(`getContCount...`);
    getParticipantContributions(project, participantId, isCoordinator).then(
        contribs => {
            console.debug(`contribs: ${contribs.length}`);
            dispatch({
                type: 'SET_CONTRIBUTIONS',
                data: { contributions: contribs, count: contribs.length },
            });
        }
    );
}

export const getEntropy = () => {
    console.debug(`entropy set`);
    return new Uint8Array(64).map(() => Math.random() * 256);
};


let worker: Worker | null = null;

export const startWorkerThread = (dispatch: React.Dispatch<any>) => {
    if (worker) return;
    if (!dispatch) return;

    worker = new window.Worker('./worker.js');
    console.debug('worker thread started');
    //worker.onmessage = (e) => ('online', loadWasm);
    worker.onmessage = (event) => {
        //console.log('message from worker:', event);
        const data = (typeof event.data === 'string') ?
        JSON.parse(event.data)
        : event.data;
      switch (data.type) {
        case 'ONLINE': {
            worker?.postMessage({type: 'LOAD_WASM'});
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
}

