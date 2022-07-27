import * as React from 'react';
import { Ceremony, CeremonyEvent, Contribution, ContributionState, ContributionSummary, Participant, ParticipantState, Project } from "../types/ceremony";

import { addCeremonyEvent, updateContribution, addOrUpdateParticipant, getProject, ceremonyQueueListener } from "../api/FirestoreApi";
import { createContext, Dispatch, PropsWithChildren, useContext, useReducer } from "react";
import { startDownload, startComputation, startUpload, endOfCircuit, getEntropy, startWorkerThread } from './Compute';
import { AuthStateContext } from './AuthContext';

export enum Step {
    NOT_ACKNOWLEDGED,
    ACKNOWLEDGED,
    INITIALISED,
    ENTROPY_COLLECTED,
    WAITING,
    QUEUED,
    RUNNING,
    COMPLETE,
}

enum ComputeMode { 
    ZKEY,
    POWERSOFTAU,
  };

      
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
      queueIndex: index,
      participantId,
      status,
      timeCompleted: new Date(),
      duration,
    }
};

export const newParticipant = (uid: string, authId: string): Participant => {
    return {
      address: '',
      uid,
      authId,
      tier: 1,
      online: true,
      addedAt: new Date(),
      state: "WAITING",
      computeProgress: 0,
    }
};

export interface ComputeStatus {
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

export interface ComputeContextInterface {
    projectId?: string;
    project?: Project;
    circuits: Ceremony[];
    computeStatus: ComputeStatus;
    messages: string [];
    contributionState?: ContributionState;
    step: Step;
    participant?: Participant;
    accessToken?: string;
    paramData?: Uint8Array;
    entropy: Uint8Array;
    progress: number; // { count: number, total: number},
    hash: string;
    contributionCount: number;
    userContributions?: any[];
    worker?: Worker;
    projectSettingsDone: boolean;
    seriesIsComplete: boolean;
    summaryGistUrl?: string;
    isProgressPanelVisible: boolean;
    joiningCircuit?: boolean;
};

export const initialState = (): ComputeContextInterface => {
    return {
        circuits: [],
        computeStatus: initialComputeStatus,
        messages: [],
        contributionState: undefined,
        step: Step.NOT_ACKNOWLEDGED,
        paramData: new Uint8Array(0),
        entropy: new Uint8Array(0),
        progress: 0, //{count: 0, total: 0},
        hash: '',
        contributionCount: 0,
        seriesIsComplete: false,
        isProgressPanelVisible: true,
        joiningCircuit: false,
        projectSettingsDone: false,
    }
}

const addMessage = (state: any, message: string) => {
    const msg = new Date().toLocaleTimeString() + ' ' + message;
    return {...state, messages: [...state.messages, msg]};
}

export const ComputeStateContext = createContext<ComputeContextInterface>(initialState());
export const ComputeDispatchContext = createContext<Dispatch<any> | undefined>(undefined);

type ComputeContextProps = PropsWithChildren<{
    project?: string,
}>

export const ComputeContextProvider = (props: ComputeContextProps) => {
    const authState = useContext(AuthStateContext);
    const [state, dispatch] = useReducer(computeStateReducer, initialState());

    if (state.projectId == undefined) {
        if (authState.project) {
            dispatch({ type: 'SET_PROJECT_ID', data: authState.project });
            console.debug(`project ID is ${authState.project}`);
        }
    } else {
        //if (state.projectId !== state.project?.id) {
        //    dispatch({ type: 'PROJECT_SETTINGS_DONE', data: false });
        //}
        if (authState.isLoggedIn && !state.projectSettingsDone) {
            getProject(state.projectId).then(p => {
                dispatch({ type: 'PROJECT_SETTINGS', data: p });
            });
            dispatch({ type: 'PROJECT_SETTINGS_DONE', data: true });
        }
    }

    return (
        <ComputeStateContext.Provider value={ state }>
          <ComputeDispatchContext.Provider value={ dispatch }>
            {props.children}
          </ComputeDispatchContext.Provider>
        </ComputeStateContext.Provider>
    );
};

const findCircuitIndex = (circuits: Ceremony[], id: string): number => {
    if (!circuits) (console.warn(`circuits will cause findIndex error`));
    return circuits.findIndex(val => val.id === id);
}

const getCurrentCircuit = (state: ComputeContextInterface) => {
    const cId = state.contributionState?.ceremony.id;
    if (cId) {
        const idx = findCircuitIndex(state.circuits, cId);
        if (idx >= 0) {
            return state.circuits[idx];
        }
    }
    return undefined;
}

const updateCompletedCircuits = (circuits: Ceremony[], contribs: any[]) => {
    contribs.map(contrib => {
        const idx = findCircuitIndex(circuits, contrib.ceremony?.id);
        if (idx >= 0) {
            circuits[idx].isCompleted = true;
            circuits[idx].hash = contrib.hash;
        }
    });
}

export const computeStateReducer = (state: any, action: any):any => {
    let newState = {...state};
    switch (action.type) {
        case 'UPDATE_CIRCUIT': {
            // A circuit has been added or updated. 
            const circuit: Ceremony = action.data;
            const idx = findCircuitIndex(newState.circuits, circuit.id);
            if (idx >= 0) {
              newState.circuits[idx] = circuit;
            } else {
              console.debug(`adding circuit ${circuit.title}`);
              newState.circuits.push(circuit);
            }
            return newState;
        }
        case 'SET_CIRCUITS': {
            newState.circuits = action.data;
            return newState;
        }
        case 'INCREMENT_COMPLETE_COUNT': {
            // Circuit verification advised by server - increment the count
            const cctId = action.data;
            const idx = findCircuitIndex(newState.circuits, cctId);
            if (idx >= 0) {
              newState.circuits[idx].complete++;
            }
            return newState;
        }
        case 'START_COMPUTE': {
            console.debug(`START_COMPUTE ${state.computeStatus.running}`);
            if (state.computeStatus.running) { // Avoid multiple invocations
                return state;
            }

            // Create event in Firestore
            // Maybe do this with pub/sub for faster turnaround
            addCeremonyEvent(action.ceremonyId, createCeremonyEvent(
                "START_CONTRIBUTION",
                `Starting turn for index ${action.index}`,
                action.index
            ));
            const contribution: Contribution = {
                participantId: state.participant?.uid || '??',
                participantAuthId: state.participant?.authId,
                queueIndex: state.contributionState.queueIndex,
                priorIndex: state.contributionState.lastValidIndex,
                lastSeen: new Date(),
                status: "RUNNING",
            };
            updateContribution(action.ceremonyId, contribution).then(() => {
                action.dispatch({
                    type: 'DOWNLOAD',
                    dispatch: action.dispatch,
                })
            });

            newState.contributionState = {...state.contributionState, startTime: Date.now()};
            newState.computeStatus = {...state.computeStatus, running: true };
            return newState;
        }
        case 'DOWNLOAD': {            
            console.debug(`DOWNLOAD`);
            if (state.computeStatus.downloading) { // Avoid multiple invocations
                return state;
            }
            newState.contributionState = {...state.contributionState, startTime: Date.now()};
            newState.computeStatus = {...state.computeStatus, running: true, downloading: true};
            const suffix: string = (state.contributionState.ceremony.mode === 'POWERSOFTAU') ? 'ptau' : 'zkey';
            startDownload(state.contributionState.ceremony.id, state.contributionState.lastValidIndex, state.contributionState.ceremony.zkeyPrefix, suffix, action.dispatch);
            newState.progress = {count: 0, total: 0};
            console.debug(`Started download`);
            return newState;
        }
        case 'DOWNLOADED': {

            console.debug(`DOWNLOADED: ${state.computeStatus.downloaded}`);
            if (state.computeStatus.downloaded) { return state } // Avoid duplicate invocations

            //console.log('Source params', action.data);
            addCeremonyEvent(action.ceremonyId, createCeremonyEvent(
                "PARAMS_DOWNLOADED",
                `Parameters from participant ${state.contributionState.lastValidIndex} downloaded OK`,
                state.contributionState.queueIndex
            ));
            newState.paramData = action.data;
            //const msg = `Parameters downloaded.`;
            //newState = addMessage(newState, msg);
            newState.computeStatus = {...state.computeStatus, downloaded: true, started: true};
            const userId = state.participant?.authId || 'anonymous';
            startComputation(action.data, state.entropy, userId , action.dispatch, state.worker);
            console.debug('running computation......');
            newState.progress = 0;
            return newState;
        }
        case 'PROGRESS_UPDATE': {
            return {...state, progress: action.data};
        }
        case 'SET_HASH': {
            // snarkjs returns Uint8Arr
            const hash = Array.prototype.map.call(action.hash, x => ('00' + x.toString(16)).slice(-2)).join('');
            let h = '';
            //let oldHash = action.hash.replace('0x', '');
            let separator = '';
            let j = 0;
            for (let i = 0; i<hash.length; i+=8) {
                const s = hash.slice(i, i+8);
                h = h.concat(separator, s);
                if (j++ >= 3) {
                    h = h.concat('\n');
                    j = 0;
                }
                separator = ' ';                
            }
            console.debug(`Hash: ${h}`);
            //const msg = `Hash: ${h}`;
            //newState = addMessage(state, msg);
            newState.hash = h;
            const cct = getCurrentCircuit(state);
            if (cct) { cct.hash = h; }
            return newState;
        }
        case 'COMPUTE_DONE': {
            console.log(`Computation finished ${action.newParams.length}`);
            newState.computeStatus = {
                ...state.computeStatus,
                computed: true,
                newParams: action.newParams,
            };
            newState.progress = 0;
            addCeremonyEvent(state.contributionState.ceremony.id, createCeremonyEvent(
                "COMPUTE_CONTRIBUTION", 
                `Contribution for participant ${state.contributionState.queueIndex} completed OK`,
                state.contributionState.queueIndex
            ));
            newState.entropy = new Uint8Array(); // Reset now that it has been used
            newState.paramData = new Uint8Array();
            //const msg = `Computation completed.`;
            //newState = addMessage(newState, msg);
            const suffix: string = (state.contributionState.ceremony.mode === 'POWERSOFTAU') ? 'ptau' : 'zkey';
            startUpload(state.contributionState.ceremony.id, 
                state.contributionState.queueIndex, 
                state.contributionState.ceremony.zkeyPrefix, 
                suffix, 
                action.newParams, 
                action.dispatch);
            return newState;
        }
        case 'UPLOADED': {
            const { queueIndex, ceremony, startTime } = state.contributionState;
            // Avoid double invocation
            if (!state.contributionSummary || state.contributionSummary.status !== 'COMPLETE') {
                addCeremonyEvent(ceremony.id, createCeremonyEvent(
                    "PARAMS_UPLOADED", 
                    `Parameters for participant ${queueIndex} uploaded to ${action.file}`,
                    queueIndex
                ));
                //let msg = `Parameters uploaded.`;
                //newState = addMessage(state, msg);
                const duration = (Date.now() - startTime) / 1000;
                const contribution = createContributionSummary(
                    state.participant ? state.participant.uid : '??',
                    "COMPLETE", 
                    action.file, 
                    queueIndex, 
                    state.hash,
                    duration
                );
                newState.contributionSummary = contribution;
                
                updateContribution(ceremony.id, contribution).then( () => {
                    endOfCircuit(state.participant.uid, action.dispatch);
                });

                // Mark it complete
                const cct = getCurrentCircuit(newState);
                if (cct) { cct.isCompleted = true; }

                newState.userContributions.push({...contribution, ceremony: cct});
    
                //startCreateGist(ceremony, queueIndex, state.hash, state.accessToken, action.dispatch);
            }
            newState.progress = 0;
            return newState;
        }
        case 'CREATE_SUMMARY': {
            // This action is not used!!
            // End-of-circuit actions completed
            //let msg;
            if (state.contributionState) {
                const { queueIndex, ceremony } = state.contributionState;
                if (action.gistUrl) {
                    addCeremonyEvent(ceremony.id, createCeremonyEvent(
                        "GIST_CREATED", 
                        `Contribution recorded at ${action.gistUrl}`,
                        queueIndex
                    ));
                    //msg = `Gist created at ${action.gistUrl}`;
                    //newState = addMessage(state, msg);
                }
                const contribution = newState.contributionSummary;
                //contribution.gistUrl = action.gistUrl;
                updateContribution(ceremony.id, contribution).then( () => {
                    endOfCircuit(state.participant.uid, action.dispatch);
                });

                // Mark it complete
                const cct = getCurrentCircuit(newState);
                if (cct) { cct.isCompleted = true; }
            }

            return newState;
        }
        case 'END_OF_CIRCUIT': {
            // End-of-circuit actions completed
            // Clean up and return to waiting
            newState.computeStatus = initialComputeStatus;
            newState.contributionState = null;
            newState.contributionSummary = null;
            newState.hash = '';
            newState.step = Step.INITIALISED;
            newState.joiningCircuit = false;
            newState.progress = 0;
            newState.contributionCount++;
            return newState;
        }
        case 'ADD_MESSAGE': {
            newState = addMessage(state, action.message);
            return newState;
        }
        case 'ACKNOWLEDGE': {
            console.debug(`ACKNOWLEDGE`);
            startWorkerThread(action.dispatch);
            return {...state, step: Step.ACKNOWLEDGED};
        }
        case 'WAIT': {
            return { ...state, step: Step.WAITING };
        }
        case 'SET_STEP': {
            console.debug(`step updated ${action.data}`);
            return {...state, step: action.data}
        }
        case 'JOINING_CIRCUIT': {
            return {...state, joiningCircuit: true }
        }
        case 'SET_CEREMONY': {
            newState.joiningCircuit = false;
            newState.contributionState = action.data;
            //const msg = `You are in the queue for ceremony ${action.data.ceremony.title}`;
            //newState = addMessage(newState, msg);
            // Collect entropy
            if (newState.entropy.length === 0) {
                newState.entropy = getEntropy();
            }
            if (newState.contributionState.queueIndex === 1) {
                // There is no prior contributor to wait for
                newState.step = Step.RUNNING;
                newState.computeStatus.ready = true;
            } else {
                newState.step = Step.QUEUED;
                ceremonyQueueListener(action.data.ceremony.id, action.data.updateQueue);
            }
            return newState;
        }
        case 'UPDATE_QUEUE': {
            newState.contributionState = {...state.contributionState, ...action.data};
            if (newState.contributionState.queueIndex === newState.contributionState.currentIndex) {
                console.debug(`we are go`);
                if (action.unsub) action.unsub(); // unsubscribe from the queue listener
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
        case 'SET_CONTRIBUTIONS': {
            // Participant's contributions, loaded from DB
            if (newState.step === Step.ACKNOWLEDGED) {
                newState.step = Step.INITIALISED;
            } else if (action.data.count == state.circuits.size) {
                newState.step = Step.COMPLETE;
            }
            updateCompletedCircuits(state.circuits, action.data.contributions);
            return {...state, 
                contributionCount: action.data.count, 
                userContributions: action.data.contributions,
                step: newState.step,
                joiningCircuit: false,
            };
        }
        case 'SET_SETTINGS': {
            return {...state, siteSettings: action.data};
        }
        case 'SET_WORKER': {
            return { ...state, worker: action.data };
        }
        case 'END_OF_SERIES': {
            return { ...state, seriesIsComplete: true, joiningCircuit: false, step: Step.COMPLETE };
        }
        case 'SUMMARY_GIST_CREATED': {
            return { ...state, summaryGistUrl: action.data };
        }
        case 'ABORT_CIRCUIT': {
            // Invalidate the contribution
            const contribution = state.contributionState;
            contribution.status = 'INVALIDATED';
            const ceremonyId = contribution.ceremony.id;
            const {ceremony, ...newCont } = contribution;
            updateContribution(ceremonyId, newCont).then(() => {
                // Add event notifying of error
                addCeremonyEvent(ceremonyId, createCeremonyEvent(
                    "ABORTED", 
                    `Error encountered while processing: ${action.data}`,
                    contribution.queueIndex
                )).then(() => {
                    // Clean up the circuit
                    endOfCircuit(state.participant.uid, action.dispatch);
                });
            });
            //const msg = `Error encountered. This circuit will be skipped.`;
            //newState = addMessage(newState, msg);
            break;
        }
        case 'VISIBILITY': {
            // Progress panel visibililty
            return {...state, isProgressPanelVisible: action.data};
        }
        case 'SET_PROJECT_ID': {
            return {...state, projectId: action.data};
        }
        case 'PROJECT_SETTINGS': {
            return {...state, project: action.data};
        }
        case 'PROJECT_SETTINGS_DONE': {
            return {...state, projectSettingsDone: action.data};
        }
    }
    console.debug(`state after reducer ${newState.step}`);
    return newState;
}
