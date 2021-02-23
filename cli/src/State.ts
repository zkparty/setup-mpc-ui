
// Properties reset by list
const defaultCeremony = {
    haveEntropy: false,
    autoRun: false,
    waiting: false,
    downloaded: false,
    computed: false,
    uploaded: false,
    startTime: null,
    contributionState: null,
    entropy: null,
    oldFile: null,
    newFile: null,
    hash: null,
}

const defaultState = {
    joined: false,
    ceremonyList: [],
    selectedCeremony: -1,
    ...defaultCeremony,
}

let state = {
    loggedIn: false,
    listed: false,
    user: null,
    ...defaultState,
};

export enum StateChange {
    LOGIN,
    LOGOUT,
    LISTED,
    JOINED,
    WAIT,
    WAIT_DONE,
    AUTO_RUN,
    SET_ENTROPY,
    DOWNLOADED, 
    COMPUTED,
    UPLOADED,
    UPDATE_CONTRIBUTION_STATUS,
};

export const setState = (newState: StateChange, data?: any) => {
    switch (newState) {
        case StateChange.LOGIN: {
            state.user = data;
            state.loggedIn = !!data;
            break;
        }
        case StateChange.LOGOUT: {
            state.loggedIn = false;
            break;
        }
        case StateChange.LISTED: {
            state = {...state, ...defaultState}; // Resets contribution
            state.ceremonyList = data;
            if (data && data.length>0) state.listed = true;
            break;
        }
        case StateChange.JOINED: {
            state = {...state, ...defaultCeremony};
            state.selectedCeremony = data?.index;
            state.contributionState = data?.contribState;
            state.joined = !!data;
            state.waiting = true;
            break;
        }
        case StateChange.WAIT: {
            state.waiting = true;
            break;
        }
        case StateChange.WAIT_DONE: {
            state.waiting = false;
            break;
        }
        case StateChange.AUTO_RUN: {
            state.autoRun = true;
            break;
        }
        case StateChange.SET_ENTROPY: {
            state.entropy = data;
            state.haveEntropy = !!data;
            break;
        }
        case StateChange.DOWNLOADED: {
            state.oldFile = data;
            state.downloaded = !!data;
            state.waiting = false;
            state.startTime = new Date();
            break;
        }
        case StateChange.COMPUTED: {
            state.newFile = data.file;
            state.hash = data.hash;
            state.computed = !!data;
            state.entropy = null;
            break;
        }
        case StateChange.UPLOADED: {
            state.uploaded = true;
            state.contributionState.endTime = Date.now();
            state.autoRun = false;
            break;
        }
        case StateChange.UPDATE_CONTRIBUTION_STATUS: {
            state.contributionState = { ...state.contributionState, ...data };
            break;
        }
        default: {
            console.error(`Invalid state change ${newState}`);
        }
    }
}

export const getState = () => {
    return state;
}


