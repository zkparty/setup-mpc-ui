import * as React from 'react';
import { Ceremony, CeremonyEvent, Contribution, ContributionState, ContributionSummary, Participant, ParticipantState } from "../types/ceremony";

import { addCeremonyEvent, addOrUpdateContribution, addOrUpdateParticipant, countParticipantContributions } from "../api/FirestoreApi";
import { createContext, Dispatch, useContext, useReducer } from "react";
import { startWorkerThread, startDownload, startComputation, startUpload, startCreateGist } from './Compute';

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

interface ComputeContextInterface {
    computeStatus: ComputeStatus,
    messages: string [],
    contributionState?: ContributionState,
    step: Step,
    participant?: Participant,
    paramData?: Uint8Array,
    entropy: Uint8Array,
    progress: number, // { count: number, total: number},
    hash: string,
    contributionCount: number,
    worker?: Worker,
};

export const initialState: ComputeContextInterface = {
    computeStatus: initialComputeStatus,
    messages: [],
    contributionState: undefined,
    step: Step.NOT_ACKNOWLEDGED,
    paramData: new Uint8Array(0),
    entropy: new Uint8Array(0),
    progress: 0, //{count: 0, total: 0},
    hash: '',
    contributionCount: 0,
}

const addMessage = (state: any, message: string) => {
    const msg = new Date().toLocaleTimeString() + ' ' + message;
    return {...state, messages: [...state.messages, msg]};
}

export const ComputeStateContext = createContext<ComputeContextInterface>(initialState);
export const ComputeDispatchContext = createContext<Dispatch<any> | undefined>(undefined);

export const ComputeContextProvider = ({ children }:any) => {
    const [state, dispatch] = useReducer(computeStateReducer, initialState);

    //console.debug(`ComputeContextProvider ${!!dispatch}`);

    return (
        <ComputeStateContext.Provider value={ state }>
          <ComputeDispatchContext.Provider value={ dispatch }>
            {children}
          </ComputeDispatchContext.Provider>
        </ComputeStateContext.Provider>
      )    
};

export const computeStateReducer = (state: any, action: any):any => {
    let newState = {...state};
    switch (action.type) {
        case 'START_COMPUTE': {
            const msg = `It's your turn to contribute`;
            newState = addMessage(state, msg);
            // Create event in Firestore
            addCeremonyEvent(action.ceremonyId, createCeremonyEvent(
                "START_CONTRIBUTION",
                `Starting turn for index ${action.index}`,
                action.index
            ));
            const contribution: Contribution = {
                participantId: state.participant?.uid || '??',
                queueIndex: state.contributionState.queueIndex,
                lastSeen: Date.now(),
                status: "RUNNING",
            };
            addOrUpdateContribution(action.ceremonyId, contribution);
            newState.contributionState = {...state.contributionState, startTime: Date.now()};
            newState.computeStatus = {...state.computeStatus, running: true, downloading: true};
            startDownload(state.contributionState.ceremony.id, state.contributionState.lastValidIndex, action.dispatch);
            return newState;
        }
        case 'DOWNLOADED': {
            //console.log('Source params', action.data);
            addCeremonyEvent(action.ceremonyId, createCeremonyEvent(
                "PARAMS_DOWNLOADED",
                `Parameters from participant ${state.contributionState.lastValidIndex} downloaded OK`,
                state.contributionState.queueIndex
            ));
            newState.paramData = action.data;
            const msg = `Parameters downloaded.`;
            newState = addMessage(newState, msg);
            newState.computeStatus = {...state.computeStatus, downloaded: true, started: true};
            if (state.worker) startComputation(action.data, state.entropy, state.worker);
            console.debug('running computation......');
            newState.progress={ data: 0 };
            return newState;
        }
        case 'PROGRESS_UPDATE': {
            return {...state, progress: action.data};
        }
        case 'SET_HASH': {
            let h = '';
            let separator = '';
            for (let i = 0; i<action.hash.length; i+=8) {
                const s = action.hash.slice(i, i+8);
                h = h.concat(separator, s);
                separator = ' ';
            }
            const msg = `Hash: ${h}`;
            newState = addMessage(state, msg);
            newState.hash = action.hash;
            return newState;
        }
        case 'COMPUTE_DONE': {
            console.log(`Computation finished ${action.newParams.length}`);
            newState.computeStatus = {
                ...state.computeStatus,
                computed: true,
                newParams: action.newParams,
            };
            newState.progress = {count: 0, total: 100};
            addCeremonyEvent(state.contributionState.ceremony.id, createCeremonyEvent(
                "COMPUTE_CONTRIBUTION", 
                `Contribution for participant ${state.contributionState.queueIndex} completed OK`,
                state.contributionState.queueIndex
            ));
            newState.entropy = new Uint8Array(); // Reset now that it has been used
            newState.paramData = new Uint8Array();
            const msg = `Computation completed.`;
            newState = addMessage(newState, msg);
            startUpload(state.contributionState.ceremony.id, state.contributionState.queueIndex, action.newParams, action.dispatch);
            return newState;
        }
        case 'UPLOADED': {
            const { queueIndex, ceremony, startTime } = state.contributionState;
            addCeremonyEvent(ceremony.id, createCeremonyEvent(
                "PARAMS_UPLOADED", 
                `Parameters for participant ${queueIndex} uploaded to ${action.file}`,
                queueIndex
            ));
            let msg = `Parameters uploaded.`;
            newState = addMessage(state, msg);
            const duration = ((Date.now()) - startTime) / 1000;
            const contribution = createContributionSummary(
                 state.participant ? state.participant.uid : '??',
                 "COMPLETE", 
                 action.file, 
                 queueIndex, 
                 state.hash,
                 duration
            );
            newState.contributionSummary = contribution;
            startCreateGist(ceremony, queueIndex, state.hash, state.accessToken, action.dispatch);

            return newState;
        }
        case 'GIST_CREATED': {
            const { queueIndex, ceremony } = state.contributionState;
            let msg;
            if (action.gistUrl) {
                addCeremonyEvent(ceremony.id, createCeremonyEvent(
                    "GIST_CREATED", 
                    `Contribution recorded at ${action.gistUrl}`,
                    queueIndex
                ));
                msg = `Gist created at ${action.gistUrl}`;
                newState = addMessage(state, msg);
            }
            
            const contribution = newState.contributionSummary;
            contribution.gistUrl = action.gistUrl;
            addOrUpdateContribution(ceremony.id, contribution);
            msg = `Thank you for your contribution.`;
            newState = addMessage(newState, msg);

            // Clean up and return to waiting
            newState.computeStatus = initialComputeStatus;
            newState.contributionState = null;
            newState.contributionSummary = null;
            newState.hash = '';
            newState.step = Step.INITIALISED;
            newState.contributionCount ++;
            return newState;
        }
        case 'ADD_MESSAGE': {
            newState = addMessage(state, action.message);
            return newState;
        }
        case 'ACKNOWLEDGE': {
            //startWorkerThread();
            return {...state, step: Step.ACKNOWLEDGED};
        }
        case 'WAIT': {
            return { ...state, step: Step.WAITING };
        }
        case 'SET_STEP': {
            console.debug(`step updated ${action.data}`);
            return {...state, step: action.data}
        }
        case 'SET_CEREMONY': {
            newState.contributionState = action.data;
            const msg = `You are in the queue for ceremony ${action.data.ceremony.title}`;
            newState = addMessage(newState, msg);
            if (newState.contributionState.queueIndex == 1) {
                newState.step = Step.RUNNING;
                newState.computeStatus.ready = true;
            } else {
                newState.step = Step.QUEUED;
            }
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
            console.debug(`set participant ${action.data.uid}`);
            addOrUpdateParticipant(action.data);
            return { ...newState, participant: action.data, accessToken: action.accessToken };
        }
        case 'SET_ENTROPY': {
            return {...state, entropy: action.data};
        }
        case 'SET_CONTRIBUTION_COUNT': {
            return {...state, contributionCount: action.data};
        }
        case 'SET_WORKER': {
            return { ...state, worker: action.data };
        }
    }
    console.debug(`state after reducer ${newState.step}`);
    return newState;
}

