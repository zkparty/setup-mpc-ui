import * as chalk from 'chalk';
import { getState, setState, StateChange } from './State';
import { addCeremonyEvent, addOrUpdateContribution, ceremonyQueueListener,
    ceremonyQueueListenerUnsub, getCeremonies, getContribution, getEligibleCeremonies,
    joinCeremony as joinCeremonyApi, 
    updateContribution} from './api/FirestoreApi';
import { getParamsFile, uploadParams } from './api/FileApi';
import * as path from 'path';

import { CeremonyEvent, Contribution, ContributionState, ContributionSummary, ParticipantState } from './types/ceremony';
import { createGist } from './api/ZKPartyApi';

const Logger = require('js-logger');
const consoleHandler = Logger.createDefaultHandler();
var logCatcher = [];
const captureHandler = (messages, context) => {
    if (context.level === Logger.INFO) {
        logCatcher.push(messages[0]);
    }
};
Logger.useDefaults();

Logger.setHandler((m, c) => {
    consoleHandler(m, c);
    captureHandler(m, c);
});

const snarkjs = require('snarkjs');

export const listCeremonies = async () => {
    const state = getState();

    let ceremonies = [];
    if (state.loggedIn) {
        ceremonies = await getEligibleCeremonies(state.user.uid)
        console.debug(`ceremonies: ${ceremonies.length}`);
        setState(StateChange.LISTED, ceremonies);
    } else {
        ceremonies = await getCeremonies();
    }
    console.log(chalk.greenBright.underline('Ceremonies'));
    let i = 1;
    ceremonies.forEach(c => {
        console.log(chalk.green(`${i++}. ${c.title}`));
    });

};

export const joinCeremony = async (arg: string) => {
    const state = getState();
    try {
        const c = parseInt(arg);
        if ((c > 0) && (c <= state.ceremonyList.length)) {
            const ceremony = state.ceremonyList[c-1];
            console.log(`Joining ${ceremony.title} ...`);
            // Add contribution to DB (WAITING)
            const contribState = await joinCeremonyApi(ceremony.id, state.user.uid);
            console.log(`You are contributor number ${contribState.queueIndex}`);
            // Start queue listener
            ceremonyQueueListener(ceremony.id, updateQueue);
            // Set local state
            setState(StateChange.JOINED, {index: c-1, contribState});
        } else {
            console.log('Invalid argument');
        }
    } catch (err) {
        console.log(`Error: ${err.message}`);
    }
};

const updateQueue = (cs: ContributionState) => {
    const state = getState();
    const myIndex = state.contributionState.queueIndex;
    //console.debug(`my index is ${myIndex}`);
    // Check the new index - is it out turn?
    if (myIndex == cs.currentIndex) {
        // Yes
        console.log(chalk.greenBright(`It is your turn to contribute`));
        // Unsubscribe to contribution updates
        if (ceremonyQueueListenerUnsub) ceremonyQueueListenerUnsub();
        // Cancel waiting state
        setState(StateChange.WAIT_DONE);
        // Are we running on auto? If so, start the process
        if (state.autoRun) {
            runCeremony();
        }
    } else {
        console.log(`Participant ${cs.currentIndex} is starting their turn`);
    }
}

export const getEntropy = async (rl, arg?: string) => {
    if (arg && arg.length > 1) {
        setState(StateChange.SET_ENTROPY, arg);
        return;
    }
    // Collect entropy
    await new Promise(resolve => {
        rl.question(
            'Enter random text to be used as your entropy:', (ent: string) => {
                if (ent && ent.length>0) {
                    setState(StateChange.SET_ENTROPY, ent);
                    console.log('Entropy saved');
                    resolve(ent);
                }
            }
        );
    });
};

export const runCeremony = async () => {
    console.log(`Running...`);
    // Called when waiting is finished (notified via queue update)
    // download
    await download();
    // compute
    await compute();
    // upload
    await upload();

    await attest();
};

export const download = async () => {
    const state = getState();
    const ceremonyId = state.ceremonyList[state.selectedCeremony].id;
    console.log(`Downloading prior contributor's data...`);
    addCeremonyEvent(ceremonyId, createCeremonyEvent(
        "START_CONTRIBUTION",
        `Starting turn for index ${state.contributionState.currentIndex}`,
        state.contributionState.currentIndex
    ));
    const contribution: Contribution = {
        participantId: state.user.uid || '??',
        participantAuthId: state.user?.username || 'anonymous',
        queueIndex: state.contributionState.queueIndex,
        priorIndex: state.contributionState.lastValidIndex,
        lastSeen: new Date(),
        status: "RUNNING",
        mode: 'CLI',
    };
    addOrUpdateContribution(ceremonyId, contribution);

    setState(StateChange.UPDATE_CONTRIBUTION_STATUS, {
        startTime: new Date()
    });

    const oldFilePath = path.join(__dirname, '..', '..', 'data', `ph2_${state.contributionState.lastValidIndex}.zkey`);
    await getParamsFile(ceremonyId, state.contributionState.lastValidIndex, oldFilePath)
        .catch(err => { 
            console.error(chalk.red(`Error downloading file: ${err.message}`));
            return; // TODO - INVALIDATE
        });
    
    // Download prior .zkey
    console.log(chalk.greenBright(`ZKey file downloaded ${oldFilePath}`));

    setState(StateChange.DOWNLOADED, oldFilePath);
};

const createCeremonyEvent = (eventType: string, message: string, index: number | undefined): CeremonyEvent => {
    return {
        sender: "PARTICIPANT",
        index,
        eventType,
        timestamp: new Date(),
        message,
        acknowledged: false,
    };
};

export const compute = async () => {
    const state = getState();
    const ceremonyId = state.ceremonyList[state.selectedCeremony].id;
    // 
    const oldZkey = state.oldFile;
    const consoleLogger = Logger.get('console');
    // convert to zkey
    const dataPath = path.join(__dirname, '..', '..', 'data'); 
    //TODO - download this?
    //const priorZkey = path.join(dataPath, 'prior.zkey');
    //const oldZkey = path.join(dataPath, 'old.zkey');
    const username = `${state.user.username || 'anonymous'} (${state.contributionState.queueIndex})`;
    //console.debug(`import params...`);
    //await snarkjs.zKey.importBellman(priorZkey, oldFilePath, oldZkey, username, consoleLogger);
    //console.log(`Convert to zkey done`);

    // newFilePath
    const newZkey = path.join(dataPath, `ph2_${state.contributionState.queueIndex}.zkey`);

    // call snarkjs to contribute 
    let entropy = state.entropy;
    logCatcher = [];
    await snarkjs.zKey.contribute(oldZkey, newZkey, username, entropy, Logger);
    entropy = null;
    //console.log(chalk.green(`Contribute done`));
    // Parse logs to get hash
    const hash = parseHash(logCatcher);
    console.log(chalk.green(`Hash: ${hash}`));

    // convert to params
    //const newParams = path.join(dataPath, 'new.params');
    //await snarkjs.zKey.exportBellman(newZkey, newParams, consoleLogger);
    addCeremonyEvent(ceremonyId, createCeremonyEvent(
        "COMPUTE_DONE",
        `Contribution computation finished`,
        state.contributionState.queueIndex
    ));
    
    setState(StateChange.COMPUTED, {file: newZkey, hash});
    console.log(chalk.whiteBright('Compute done'));
};

const parseHash = (logs: string[]): string => {
    let found = false;
    let hash = '';
    let count = 0;
    logs.forEach(m => {
        if (!found) {
            const match = /Contribution Hash:\s+(.*)/gs.exec(m);
            if (match) {
                hash = match[1];
                found = true;
            }
        }  
    });
    return hash;
};

export const upload = async () => {
    const state = getState();
    const index = state.contributionState.queueIndex;
    const ceremonyId = state.ceremonyList[state.selectedCeremony].id;
    console.log(`Uploading data...`);
    addCeremonyEvent(ceremonyId, createCeremonyEvent(
        "START_UPLOAD",
        `Starting upload (CLI)`,
        index
    ));

    const file = await uploadParams(ceremonyId, index, state.newFile);
    console.debug(`upload done`);
    addCeremonyEvent(ceremonyId, createCeremonyEvent(
        "PARAMS_UPLOADED",
        `Parameters for participant ${index} uploaded to ${file} (CLI)`,
        index
    ));

    console.log(chalk.green(`Parameters uploaded.`));
    const duration = (Date.now() - state.startTime) / 1000;
    const contribution = createContributionSummary(
         state.user ? state.user.uid : '??',
         "COMPLETE", 
         file, 
         index, 
         state.hash,
         duration
    );
    updateContribution(ceremonyId, index, contribution);

    setState(StateChange.UPLOADED);
    console.log('Thank you for your contribution');
};

const updateProgress = (progress: number) => {
    console.debug(`Progress: ${progress}`);
};

export const verify = async () => {
    const state = getState();
    if (state.selectedCeremony >= 0) {
        const index = state.contributionState.queueIndex;
        const ceremonyId = state.ceremonyList[state.selectedCeremony].id;

        const contrib = await getContribution(ceremonyId, index);
        if (contrib && contrib.verification) {
            console.log(chalk.white(`${contrib.verification}`));
        } else {
            console.log('Verification is not yet available. Try again soon.');
        }
    } else {
        console.log('No ceremony selected');
    }
};

export const attest = async () => {
    const state = getState();
    const index = state.contributionState.queueIndex;
    const ceremony = state.ceremonyList[state.selectedCeremony];
    const ceremonyId = ceremony.id;

    const url = await createGist(ceremonyId, ceremony.title, index, state.hash, state.user.accessToken);
    if (url && url.length>0) {
        console.log(`Gist created at ${url}`);
        const contribution: Partial<Contribution> = {
            gistUrl: url,
        }
        updateContribution(ceremony.id, index, contribution);
    }
};

const createContributionSummary = (participantId: string, status: ParticipantState, paramsFile: string, index: number, hash: string, duration: number): ContributionSummary => {
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
