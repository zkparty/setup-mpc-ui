import { Dispatch } from "react";

import { Ceremony, Project } from "../types/ceremony";
import { getParamsFile, uploadParams } from "../api/FileApi";
import { getParticipantContributions } from '../api/FirestoreApi';

export const startDownload = (ceremonyId: string, index: number, prefix: string, suffix: string, dispatch: Dispatch<any>) => {
    // DATA DOWNLOAD
    console.debug(`getting data ${ceremonyId} ${index}`);
    const progressCb = (progress: number) => dispatch({type: 'PROGRESS_UPDATE', data: progress})
    getParamsFile(ceremonyId, index, prefix, suffix, progressCb).then( paramData => {
        // deep copy so params can be transfered to worker (even with multiple invocations of same function)
        const paramsToTransferToWorker = new Uint8Array(paramData);
        console.debug(`downloaded ${paramData?.length}`);
        dispatch({
            type: 'DOWNLOADED',
            ceremonyId,
            data: paramsToTransferToWorker,
            dispatch,
        });
    }).catch(err => {
         console.error(`Error: ${err.message}. Skipping circuit`);
         // Failed download - abort and invalidate the contribution
         dispatch({type: 'ABORT_CIRCUIT', data: err.message, dispatch});
    });
};


const PROGRESS_UPDATE = 'PROGRESS_UPDATE';
export const startComputation = (params: Uint8Array, entropy: Uint8Array, participant: string,
    dispatch: Dispatch<any>, worker: Worker) => {
    try {
        console.debug(`params ${params.buffer.byteLength}`);
        const message = {
            type: 'COMPUTE',
            params: params.buffer
        };
        worker.postMessage(message, [params.buffer]);
        /*zKey.contribute( inputFd, outFd,
                participant, entropy.buffer, console, progressOptions).then( */
          /*          (hash: any) => {
                        dispatch({type: 'SET_HASH', hash});
                        const result = outFd.data;
                        console.debug(`COMPLETE ${result.length}`);
                        dispatch({type: 'COMPUTE_DONE', newParams: result, dispatch });
                }); */
    } catch (err) {
        if (err.name === 'DataCloneError') console.warn(`This might be caused by React running the reducer twice to guarantee pureness. Read more in https://github.com/facebook/react/issues/16295: ${err}`);
        else console.error(`Error in contribute: ${err}`);
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

export const startWorkerThread = (dispatch: Dispatch<any>) => {
    if (!dispatch) return;

    console.debug(`CrossOriginIsolated? ${window.crossOriginIsolated}`);
    let workerString: string;
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    if ( isFirefox ) workerString = 'worker-firefox.js';
    else workerString = 'worker-chrome.js';
    let worker = new Worker(workerString, { type: "module"});

    worker.onerror = (err) => {
        console.error(`Error in worker: ${JSON.stringify(err)}`)
    }
    console.debug('worker thread started');
    //worker.onmessage = (e) => ('online', loadWasm);
    worker.onmessage = (event) => {
        console.debug('message from worker:', JSON.stringify(event));
        const data = (typeof event.data === 'string') ?
            JSON.parse(event.data)
          : event.data;
      switch (data.type) {
        case 'ONLINE': {
            worker?.postMessage({type: 'LOAD_WASM'});
            break;
        }
        case 'LOADED': {
            console.debug('WASM loaded');
            break;
        }
        case 'PROGRESS': {
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
            console.error(`Error while computing. ${JSON.stringify(data)}`);
        }
      }
    };

    dispatch({ type: 'SET_WORKER', data: worker });
}

