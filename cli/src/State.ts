
const state = {
    loggedIn: false,
    listed: false,
    joined: false,
    haveEntropy: false,
    waiting: false,
    downloaded: false,
    computed: false,
    uploaded: false,
    user: null,
    ceremonyList: [],
    selectedCeremony: -1,
    entropy: null,
    oldFile: null,
    newFile: null,
};

export enum StateChange {
    LOGIN,
    LOGOUT,
    LISTED,
    JOINED,
    WAIT,
    SET_ENTROPY,
    DOWNLOADED, 
    COMPUTED,
    UPLOADED,
};

export const setState = (newState: StateChange, data?: any) => {
    switch (newState) {
        case StateChange.LOGIN: {
            state.user = data;
            state.loggedIn = !!data;
        }
        case StateChange.LOGOUT: {
            state.loggedIn = false;
        }
        case StateChange.LISTED: {
            state.ceremonyList = data;
            if (data && data.length>0) state.listed = true;
        }
        case StateChange.JOINED: {
            state.selectedCeremony = data;
            state.joined = !!data;
        }
        case StateChange.WAIT: {
            state.waiting = true;
        }
        case StateChange.SET_ENTROPY: {
            state.entropy = data;
            state.haveEntropy = !!data;
        }
        case StateChange.DOWNLOADED: {
            state.oldFile = data;
            state.downloaded = !!data;
            state.waiting = false;
        }
        case StateChange.COMPUTED: {
            state.newFile = data;
            state.computed = !!data;
            state.entropy = null;
        }
        case StateChange.UPLOADED: {
            state.uploaded = true;
        }
        default: {
            console.error(`Invalid state change ${newState}`);
        }
    }
}

export const getState = () => {
    return state;
}


