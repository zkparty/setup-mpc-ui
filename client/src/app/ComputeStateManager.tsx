import { getParamsFile, UploadParams } from "../api/FileApi";
import { CeremonyEvent, ContributionState, ContributionSummary, Participant, ParticipantState } from "../types/ceremony";

import { addCeremonyEvent, addOrUpdateContribution, addOrUpdateParticipant } from "../api/FirestoreApi";

export enum Step {
    NOT_ACKNOWLEDGED,
    ACKNOWLEDGED,
    INITIALISED,
    ENTROPY_COLLECTED,
    WAITING,
    QUEUED,
    RUNNING,
}
      
export const createCeremonyEvent = (eventType: string, message: string, index: number | undefined): CeremonyEvent => {
    return {
        sender: "PARTICIPANT",
        index,
        eventType,
        timestamp: new Date(),
        message,
        acknowledged: false,
    };
};

export const createContributionSummary = (participantId: string, status: ParticipantState, paramsFile: string, index: number, hash: string, duration: number): ContributionSummary => {
    return {
      lastSeen: new Date(),
      hash,
      paramsFile,
      index,
      participantId,
      status,
      timeCompleted: new Date(),
      duration,
    }
};

export const newParticipant = (uid: string): Participant => {
    return {
      address: '',
      uid,
      tier: 1,
      online: true,
      addedAt: new Date(),
      state: "WAITING",
      computeProgress: 0,
    }
};

interface ComputeStatus {
    ready: boolean,
    running: boolean,
    downloading: boolean,
    downloaded: boolean,
    started: boolean,
    computed: boolean,
    cleanup: boolean,
    newParams: Uint8Array,
    uploaded: boolean,
    progress: { count: number, total: number},
  };
  
export const initialComputeStatus: ComputeStatus = {
    ready: false,
    running: false,
    downloading: false,
    downloaded: false,
    started: false,
    computed: false,
    cleanup: false,
    uploaded: false,
    newParams: new Uint8Array(),
    progress: {count: 0, total: 0},
};

export const initialState = {
    computeStatus: initialComputeStatus,
    messages: [],
    contributionState: null,
    step: Step.NOT_ACKNOWLEDGED,
    participant: undefined,
    paramData: new Uint8Array(0),
    entropy: new Uint8Array(0),
    progress: {count: 0, total: 0},
    hash: '',    
}

export const computeStateReducer = (state: any, action: any) => {
    let newState = {...state};
    switch (action.type) {
        case 'START_COMPUTE': {
            const msg = `It's your turn to contribute`;
            newState.messages = [...state.messages, msg];
            // Create event in Firestore
            addCeremonyEvent(action.ceremonyId, createCeremonyEvent(
                "START_CONTRIBUTION",
                `Starting turn for index ${action.index}`,
                action.index
            ));
            newState.contributionState = {...state.contributionState, startTime: Date.now()};
            newState.computeStatus = {...state.computeStatus, running: true, downloading: true};
            //newState.step = Step.RUNNING;
            startDownload(state.contributionState.ceremony.id, state.contributionState.lastValidIndex, action.dispatch);
            return newState;
        }
        case 'DOWNLOADED': {
            console.log('Source params', action.data);
            addCeremonyEvent(action.ceremonyId, createCeremonyEvent(
                "PARAMS_DOWNLOADED",
                `Parameters from participant ${state.contributionState.lastValidIndex} downloaded OK`,
                state.contributionState.queueIndex
            ));
            newState.paramData = action.data;
            const msg = `Parameters downloaded.`;
            newState.messages = [...state.messages, msg];
            newState.computeStatus = {...state.computeStatus, downloaded: true, started: true};
            startComputation(action.data, state.entropy);
            console.debug('running computation......');
            return newState;
        }
        case 'PROGRESS_UPDATE': {
            return {...state, progress: action.data};
        }
        case 'SET_HASH': {
            const msg = `Hash: ${action.data}`;
            newState.messages = [...state.messages, msg];
            newState.hash = action.data;
            break;
        }
        case 'COMPUTE_DONE': {
            console.log(`Computation finished ${action.newParams.length}`);
            newState.computeStatus = {
                ...state.computeStatus,
                computed: true,
                newParams: action.newParams,
            };
            newState.progress = {count: 100, total: 100};
            addCeremonyEvent(state.contributionState.ceremony.id, createCeremonyEvent(
                "COMPUTE_CONTRIBUTION", 
                `Contribution for participant ${state.contributionState.queueIndex} completed OK`,
                state.contributionState.queueIndex
            ));
            newState.entropy = new Uint8Array(); // Reset now that it has been used
            newState.paramData = new Uint8Array();
            const msg = `Computation completed.`;
            newState.messages = [...state.messages, msg];
            startUpload(state.contributationState.ceremony.id, state.contributionState.queueIndex, action.newParams, action.dispatch);
            break;
        }
        case 'UPLOADED': {
            addCeremonyEvent(state.contributionState.ceremony.id, createCeremonyEvent(
                "PARAMS_UPLOADED", 
                `Parameters for participant ${state.contributionState.queueIndex} uploaded to ${action.file}`,
                state.contributionState.queueIndex
            ));
            let msg = `Parameters uploaded.`;
            newState.messages = [...state.messages, msg];
            const duration = ((Date.now()) - state.contributionState.startTime) / 1000;
            const contribution = createContributionSummary(
                 state.participant ? state.participant.uid : '??',
                 "COMPLETE", 
                 action.file, 
                 state.contributionState.queueIndex, 
                 state.hash,
                 duration
            );
            addOrUpdateContribution(state.contributionState.ceremony.id, contribution);
            msg = `Thank you for your contribution.`;
            newState.messages = [...state.messages, msg];

            // Clean up and return to waiting
            newState.computeStatus = initialComputeStatus;
            newState.contributionState = null;
            newState.hash = '';
            newState.step = Step.WAITING;
            break;
        }
        case 'ADD_MESSAGE': {
            newState.messages = [...state.messages, action.message];
            break;
        }
        case 'SET_STEP': {
            console.debug(`step updated ${action.data}`);
            //state.step = action.data;
            switch (action.data) {
                case Step.ACKNOWLEDGED: {
                    startServiceWorker(action.dispatch);
                    break;
                }
            }
            return {...state, step: action.data}
            //break;
        }
        case 'SET_CEREMONY': {
            newState.contributionState = action.data;
            const msg = `You are in the queue for ceremony ${action.data.ceremony.title}`;
            newState.messages = [...state.messages, msg];
            newState.step = Step.QUEUED;
            return newState;
        }
        case 'UPDATE_QUEUE': {
            newState.contributionState = {...state.contributionState, ...action.data};
            if (newState.contributionState.queueIndex == newState.contributionState.currentIndex) {
                console.debug(`we are go`);
                action.unsub(); // unsubscribe from the queue listener
                newState.step = Step.RUNNING;
                newState.computeStatus.ready = true;
            }
            return newState;
        }
        case 'SET_PARTICIPANT': {
            console.debug(`set participant ${action.data}`)
            newState.participant = action.data;
            addOrUpdateParticipant(action.data);
            return newState;
        }
        case 'SET_ENTROPY': {
            newState.entropy = action.data;
            break;
        }
    }
    console.debug(`state after reducer ${newState.step}`);
    return newState;
}

export const startServiceWorker = (dispatch: (a: any) => void) => {
    navigator.serviceWorker.ready.then(() => {
        console.log('service worker ready');
        navigator.serviceWorker.addEventListener('message', event => {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'PROGRESS': {
                //console.log(`message from service worker ${message}`);
                dispatch({
                    type: 'PROGRESS_UPDATE',
                    data,
                })
                break;
            }
            case 'HASH': { 
                dispatch({type: 'SET_HASH', hash: data.hash});
                break; 
            }
            case 'COMPLETE': { 
                //const result: Uint8Array = data.result;
                dispatch({type: 'COMPUTE_DONE', newParams: data.result, dispatch })
                break; 
            }
        }
        });
    });
};

export const loadWasm = async () => {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller?.postMessage({type: 'LOAD_WASM'});
        console.debug('service worker initialised');
    } else {
        console.log('Do not have controller!');
    }
};

const startDownload = (ceremonyId: string, index: number, dispatch: (a: any) => void) => {
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

export const startComputation = (params: Uint8Array, entropy: Buffer) => {
    //const newParams = wasm.contribute(params, entropy, reportProgress, setHash);
    console.log(`params ${params.length}`);
    navigator.serviceWorker.controller?.postMessage({
        type: 'COMPUTE', 
        params, 
        entropy
    });
};

const startUpload = (ceremonyId: string, index: number, data: Uint8Array, dispatch: (a: any) => void) => {
    UploadParams(ceremonyId, index, data).then(
        paramsFile => {
            dispatch({
                type: 'UPLOADED',
                file: paramsFile,
            })
    });
}