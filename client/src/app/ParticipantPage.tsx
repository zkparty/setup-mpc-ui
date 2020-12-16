import { useEffect, Fragment } from "react";
import React, { useState, useReducer, useRef } from "react";
import styled, { css } from "styled-components";
import Typography from "@material-ui/core/Typography";
import { GetParamsFile, UploadParams } from "../api/FileApi";0
import { AuthContext } from "../app/AuthContext";

import {
  accentColor,
  secondAccent,
  textColor,
  PageContainer,
  lighterBackground,
  SectionContainer,
  CeremonyTitle
} from "../styles";
import { CeremonyEvent, ContributionState, ContributionSummary, Participant, ParticipantState } from "./../types/ceremony";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import VirtualList from "./../components/MessageList";
import Paper from "@material-ui/core/Paper";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import { addCeremonyEvent, addOrUpdateContribution, addOrUpdateParticipant, 
  ceremonyContributionListener, ceremonyQueueListener, ceremonyQueueListenerUnsub } from "../api/FirestoreApi";
import QueueProgress from './../components/QueueProgress';
import Divider from "@material-ui/core/Divider";
import { LinearProgress } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      height: 200,
      maxWidth: 650,
      backgroundColor: lighterBackground,
      color: textColor,
    },
    divider: {
      color: accentColor,
      padding: '20px',
    }
  }),
);

const StyledButton = styled(Button)`
  color: accentColor;
  background: lighterBackground;
  border-width: thin;
  border-color: accentColor;

  &:hover {
    border-color: secondAccent;
  }
`

const Acknowledge = ({ contribute }: { contribute: () => void}) => 
  (<div style={{ display: 'grid', paddingTop: '20px' }}>
    <StyledButton variant='outlined' onClick={contribute} 
      style={{color: accentColor, borderWidth: 'thin', borderColor: accentColor }}>
      Launch
    </StyledButton>
   </div>);

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

const initialComputeStatus: ComputeStatus = {
  running: false,
  downloading: false,
  downloaded: false,
  started: false,
  computed: false,
  cleanup: false,
  uploaded: false,
  newParams: new Uint8Array(),
  progress: {count: 0, total: 0},
}

const newParticipant = (uid: string): Participant => {
  return {
    address: '',
    uid,
    tier: 1,
    online: true,
    addedAt: new Date(),
    state: "WAITING",
    computeProgress: 0,
  }
}

const startComputation = (params: Uint8Array, entropy: Buffer) => {
  //const newParams = wasm.contribute(params, entropy, reportProgress, setHash);
  //console.log('Updated params', newParams);
  navigator.serviceWorker.controller?.postMessage({type: 'COMPUTE', params, entropy});
};

const welcomeText = (
  <Typography variant="body1" align="center">
  Welcome to zkparty. This page will allow you to participate in a ceremony. Click to your commence your contribution. 
  </Typography>);

enum Step {
  NOT_ACKNOWLEDGED,
  ACKNOWLEDGED,
  INITIALISED,
  ENTROPY_COLLECTED,
  WAITING,
  QUEUED,
  RUNNING,
}

const stepText = (step: string) => (<Typography align="center">{step}</Typography>);

const queueProgressCard = (contrib: ContributionState) => {
  return (
  <QueueProgress 
    {...contrib}
  >
  </QueueProgress>
)};

export const ParticipantSection = () => {
  const [step, setStep] = React.useState(Step.NOT_ACKNOWLEDGED);
  const [computeStatus, setComputeStatus] = React.useState<ComputeStatus>(initialComputeStatus);
  const [messages, setMessages] = useState<string[]>([]);
  const wasm = useRef<any | null>(null);
  const data = useRef<Uint8Array | null>(null);
  const entropy = useRef(new Uint8Array());
  const participant = useRef<Participant | null>(null);
  const contributionState = useRef<ContributionState | null>(null);
  const hash = useRef<string>('');
  const Auth = React.useContext(AuthContext);
  const classes = useStyles();

  const addMessage = (msg: string) => {
    setMessages(messages => [...messages, msg]);
  }

  const clearMessages = () => {
      setMessages([]);
  }

  const getParticipant = async () => {
    console.log(`uid: ${Auth.authUser.uid}`);
    participant.current = newParticipant(Auth.authUser.uid);
    await addOrUpdateParticipant(participant.current);
  };

  const loadWasm = async () => {
    navigator.serviceWorker.controller?.postMessage({type: 'LOAD_WASM'});        
    console.debug('service worker inited');
  };

  const getEntropy = () => {
    entropy.current = new Uint8Array(64).map(() => Math.random() * 256);
    console.debug(`entropy set`);
  };

  const setContribution = (cs: ContributionState) => {
    // Only accept new tasks if we're waiting
    if (step !== Step.RUNNING && step !== Step.QUEUED) {
      contributionState.current = cs;
      addMessage(`You are in the queue for ceremony ${cs.ceremony.title}`);
      ceremonyQueueListener(cs.ceremony.id, updateQueue);
      setStep(Step.QUEUED);
    } else {
      console.log(`Contribution candidate received while running another. ${step}`);
    }
  }

  const updateQueue = (update: any) => {
    contributionState.current = {...contributionState.current, ...update};
    if (contributionState.current) {
      const contrib = contributionState.current;
      if (contrib.queueIndex === contrib.currentIndex) {
        addMessage(`It's your turn to contribute`);
        addCeremonyEvent(contrib.ceremony.id, createCeremonyEvent(
          "START_CONTRIBUTION",
          `Starting turn for index ${contrib.currentIndex}`,
          contrib.queueIndex
        ));
        if (ceremonyQueueListenerUnsub) ceremonyQueueListenerUnsub(); // Stop listening for updates
        contrib.startTime = Date.now();
        setComputeStatus(status => {return {...status, running: true}});
        setStep(Step.RUNNING);
      }
    }
  }

  const setHash = (resultHash: string) => {
    try {
      console.debug(`setHash: ${resultHash}`);
      addMessage(`Hash: ${resultHash}`);
      hash.current = resultHash;
    } catch (err) { console.log(err.message); }
  }  

  const serviceWorker = () => {
    navigator.serviceWorker.ready.then(() => {
      console.log('service worker ready');
      navigator.serviceWorker.addEventListener('message', event => {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'PROGRESS': {            
            //console.log(`message from service worker ${message}`);
            setComputeStatus(status => {return {...status, progress: {...data}}});
            break;
          }
          case 'HASH': { 
            setHash(data.hash);
            break; 
          }
          case 'COMPLETE': { 
            //const result: Uint8Array = data.result;
            setComplete(data.result);
            break; 
          }
        }
      });
    });
  };

  const setComplete = async (newParams: Uint8Array): Promise<void> => {
    //const ceremonyId = contributionState.current?.ceremony.id || '';
    console.log(`Computation finished ${newParams.length}`);
    setComputeStatus( status => {
      return {
        ...status, 
        computed: true, 
        newParams, 
        progress: {count: computeStatus.progress.total, total: computeStatus.progress.total}
    }});
  };
  
  const compute = async () => {
    const { running, downloading, downloaded, started, computed, cleanup, uploaded, newParams } = computeStatus;
    console.log(`compute step: ${running? 'running' : '-' 
    } ${running && !downloaded  ? 'downloading' :
        running && downloaded && !computed ? 'computing' : 
        running && computed && !uploaded ? 'uploading' : 
        'inactive'}`);
    const ceremonyId = contributionState.current?.ceremony.id;

    if (running && contributionState.current && ceremonyId) {
      if (!downloaded && !downloading) {
        // DATA DOWNLOAD
        GetParamsFile(ceremonyId, contributionState.current.lastValidIndex).then( (paramData) => {
          addCeremonyEvent(ceremonyId, createCeremonyEvent(
             "PARAMS_DOWNLOADED",
             `Parameters from participant ${contributionState.current?.lastValidIndex} downloaded OK`,
             contributionState.current?.queueIndex
          ));
          console.log('Source params', paramData);
          data.current = paramData;
          addMessage(`Parameters downloaded.`);
          setComputeStatus(status => {return {...status, downloaded: true}});
        });
        setComputeStatus(status => {return {...status, downloading: true}});

      }
      if (downloaded && !computed && !started) {
        // START COMPUTE
        console.log('running computation......');
        if (data.current) {
          startComputation(data.current, Buffer.from(entropy.current));
          setComputeStatus(status => {return {...status, started: true}});
        }
      }
      if (computed && !cleanup) {
        await addCeremonyEvent(ceremonyId, createCeremonyEvent(
          "COMPUTE_CONTRIBUTION", 
          `Contribution for participant ${contributionState.current?.queueIndex} completed OK`,
          contributionState.current?.queueIndex
        ));
        entropy.current = new Uint8Array(); // Reset now that it has been used
        addMessage(`Computation completed.`);
        setComputeStatus(status => {return {...status, cleanup: true}});
      }
      if (computed && cleanup && !uploaded) {
        // UPLOAD DATA
        try {
          const newIndex = contributionState.current?.queueIndex;
          const paramsFile = await UploadParams(ceremonyId, newIndex, newParams);
          // Add event to notify status and params file name
          await addCeremonyEvent(ceremonyId, createCeremonyEvent(
            "PARAMS_UPLOADED", 
            `Parameters for participant ${newIndex} uploaded to ${paramsFile}`,
            contributionState.current?.queueIndex
          ));
          addMessage(`Parameters uploaded.`);
          const duration = ((Date.now()) - contributionState.current?.startTime) / 1000;
          const contribution = createContributionSummary(
             participant.current ? participant.current.uid : '??',
             "COMPLETE", 
             paramsFile, 
             newIndex, 
             hash.current,
             duration
            );
          await addOrUpdateContribution(ceremonyId, contribution);
          addMessage(`Thank you for your contribution.`)
        } finally {
          // RETURN TO WAIT
          setComputeStatus({...computeStatus, running: false, uploaded: true, newParams: new Uint8Array()});
          //setCeremonyId(null);
          contributionState.current = null;
          hash.current = '';
          setStep(Step.WAITING);
        }
      }
    }
  }; 

  let content = (<></>);
  if (!Auth.isLoggedIn) {
    content = (<Typography>Sorry, please login to access this page</Typography>);
  } else {
    console.log(`step ${step.toString()}`);
    switch (step) {
      case (Step.NOT_ACKNOWLEDGED): {
        // Display welcome text until the 'go ahead' button is clicked.
        content = (<div>{welcomeText}<Acknowledge contribute={() => setStep(Step.ACKNOWLEDGED)} /></div>);
        break;
      }
      case (Step.ACKNOWLEDGED): {
        // After 'go ahead' clicked
        // Display status messages for all remaining conditions
        // Initialise - get participant ID, load wasm module
        serviceWorker();
        const p1 = participant.current ? undefined : getParticipant();
        const p2 = wasm.current ? undefined : loadWasm();
        Promise.all([p1, p2]).then(() => {
          console.log('INITIALISED');
          setStep(Step.INITIALISED)
        });
        content = stepText('Loading compute module...');
        break;
      }
      case (Step.INITIALISED): {
        // Collect entropy
        if (entropy.current.length == 0) getEntropy();
        content = stepText('Collecting entropy...');
        setStep(Step.ENTROPY_COLLECTED);
        break;
      }
      case (Step.ENTROPY_COLLECTED): {
        // start looking for a ceremony to contribute to
        if (participant.current) ceremonyContributionListener(participant.current.uid, setContribution);
        content = stepText('Starting listener...');
        addMessage('Initialised.');
        setStep(Step.WAITING);
        break;
      }
      case (Step.WAITING): {
        // Waiting for a ceremony
        if (!computeStatus.running && contributionState.current) {
          console.log(`contribution state: ${JSON.stringify(contributionState.current)}`);
          if (contributionState.current.queueIndex == contributionState.current.currentIndex) {
            console.log('ready to go');
            setComputeStatus({...initialComputeStatus, running: true });
          }
        }
      
        content = stepText('No ceremonies are ready to accept your contribution at the moment.');
        break;
      }
      case (Step.QUEUED): {
        // Waiting for a ceremony
        if (!computeStatus.running && contributionState.current) {
          console.log(`contribution state: ${JSON.stringify(contributionState.current)}`);
          if (contributionState.current.queueIndex === contributionState.current.currentIndex) {
            console.log('ready to go');
            setComputeStatus({...initialComputeStatus, running: true });
          }
          content = queueProgressCard(contributionState.current);
        }
      
        break;
      }
      case (Step.RUNNING): {
        // We have a ceremony to contribute to. Download parameters
        // Compute
        // Upload
        compute();

        const progressPct = computeStatus.progress.total > 0 ? 100 * computeStatus.progress.count / computeStatus.progress.total : 0;

        content = (<>{
            !computeStatus.downloaded ? stepText('Downloading ...')
          : !computeStatus.computed ? stepText('Calculating ...')
          : stepText('Uploading ...') 
        }<LinearProgress variant="determinate" value={progressPct} /></>);
        break;
      }
  }};

  return (
      <div className={classes.root}>
        <Paper variant="outlined" className={classes.root}>
          {content}         
        </Paper>
        <Divider className={classes.divider}/>
        <Paper variant="outlined" className={classes.root}>
          <VirtualList messages={messages}/>
        </Paper>
      </div>
  );
};
