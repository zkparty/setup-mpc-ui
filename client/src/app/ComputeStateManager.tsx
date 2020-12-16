import { GetParamsFile, UploadParams } from "../api/FileApi";
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
    switch (action.type) {
        case 'START_COMPUTE': {
            const msg = `It's your turn to contribute`;
            state.messages = [...state.messages, msg];
            // Create event in Firestore
            addCeremonyEvent(action.ceremonyId, createCeremonyEvent(
                "START_CONTRIBUTION",
                `Starting turn for index ${action.index}`,
                action.index
            ));
            state.contributionState = {...state.contributionState, startTime: Date.now()};
            state.computeStatus = {...state.computeStatus, running: true, downloading: true};
            state.step = Step.RUNNING;
            startDownload(state.contributionState.ceremony.id, state.contributionState.lastValidIndex, action.dispatch);
            break;
        }
        case 'DOWNLOADED': {
            addCeremonyEvent(action.ceremonyId, createCeremonyEvent(
                "PARAMS_DOWNLOADED",
                `Parameters from participant ${state.contributionState.lastValidIndex} downloaded OK`,
                state.contributionState.queueIndex
            ));
            console.log('Source params', action.paramData);
            state.paramData = action.paramData;
            const msg = `Parameters downloaded.`;
            state.messages = [...state.messages, msg];
            state.computeStatus = {...state.computeStatus, downloaded: true, started: true};
            startComputation(action.paramData, state.entropy);
            console.debug('running computation......');
            break;
        }
        case 'PROGRESS_UPDATE': {
            state.progress = action.data;
            break;
        }
        case 'SET_HASH': {
            const msg = `Hash: ${action.data}`;
            state.messages = [...state.messages, msg];
            state.hash = action.data;
            break;
        }
        case 'COMPUTE_DONE': {
            console.log(`Computation finished ${action.newParams.length}`);
            state.computeStatus = {
                ...state.computeStatus,
                computed: true,
                newParams: action.newParams,
            };
            state.progress = {count: 100, total: 100};
            addCeremonyEvent(state.contributionState.ceremony.id, createCeremonyEvent(
                "COMPUTE_CONTRIBUTION", 
                `Contribution for participant ${state.contributionState.queueIndex} completed OK`,
                state.contributionState.queueIndex
            ));
            state.entropy = new Uint8Array(); // Reset now that it has been used
            state.paramData = new Uint8Array();
            const msg = `Computation completed.`;
            state.messages = [...state.messages, msg];
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
            state.messages = [...state.messages, msg];
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
            state.messages = [...state.messages, msg];

            // Clean up and return to waiting
            state.computeStatus = initialComputeStatus;
            state.contributionState = null;
            state.hash = '';
            state.step = Step.WAITING;
            break;
        }
        case 'ADD_MESSAGE': {
            state.messages = [...state.messages, action.message];
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
            state.contributionState = action.data;
            const msg = `You are in the queue for ceremony ${action.data.ceremony.title}`;
            state.messages = [...state.messages, msg];
            state.step = Step.QUEUED;
            break;
        }
        case 'UPDATE_QUEUE': {
            state.contributionState = {...state.contributionState, ...action.data};
            if (state.contributionState.queueIndex == state.contributionState.currentIndex) {
                action.unsub(); // unsubscribe to the queue listener
                // Start the computation
                action.dispatch({
                    type: 'START_COMPUTE',
                    ceremonyId: state.contributionState.ceremony.id,
                    index: state.contributionState.queueIndex,
                    dispatch: action.dispatch,
                  });          
            }
            break;
        }
        case 'SET_PARTICIPANT': {
            console.debug(`set participant ${action.data}`)
            state.participant = action.data;
            addOrUpdateParticipant(action.data);
            break;
        }
        case 'SET_ENTROPY': {
            state.entropy = action.data;
            break;
        }
    }
    console.debug(`state after reducer ${state.step}`);
    return state;
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
    GetParamsFile(ceremonyId, index).then( (paramData) => {
        dispatch({
            type: 'DOWNLOADED',
            data: paramData,
        });
    });
};

export const startComputation = (params: Uint8Array, entropy: Buffer) => {
    //const newParams = wasm.contribute(params, entropy, reportProgress, setHash);
    //console.log('Updated params', newParams);
    navigator.serviceWorker.controller?.postMessage({type: 'COMPUTE', params, entropy});
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