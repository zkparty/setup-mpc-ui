import { Link, RouteProps, useHistory } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import * as React from "react";
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
import {
  getCeremonySummaries,
  getCeremonySummariesCached
} from "../api/ZKPartyApi";
import { CeremonyEvent, ContributionState, ContributionSummary, Participant, ParticipantState } from "./../types/ceremony";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import { addCeremonyEvent, addOrUpdateContribution, addOrUpdateParticipant, ceremonyContributionListener } from "../api/FirebaseApi";

const Acknowledge = ({ contribute }: { contribute: () => void}) => (<Button onClick={contribute} style={{color: 'white'}}>Contribute</Button>);

// const Unloaded = (props: { loading: boolean, loadWasm: any }) => {
//   return props.loading ? (
//     <div>Loading...</div>
//   ) : (
//     <Button onClick={props.loadWasm} style={{color: 'white'}}>Load library</Button>
//   );
// };

const CreateCeremonyEvent = (eventType: string, message: string): CeremonyEvent => {
  return {
    sender: "PARTICIPANT",
    eventType,
    timestamp: new Date(),
    message,
    acknowledged: false,  
  };
};

const CreateContributionSummary = (participantId: string, status: ParticipantState, paramsFile: string, index: number, hash: string): ContributionSummary => {
  return {
    lastSeen: new Date(),
    hash,
    paramsFile,
    index,
    participantId,
    status,
    timeCompleted: new Date(),
  }
};

interface ComputeStatus {
  running: boolean,
  downloaded: boolean,
  started: boolean,
  computed: boolean,
  newParams: Uint8Array,
  uploaded: boolean,
};

const initialComputeStatus: ComputeStatus = {
  running: false,
  downloaded: false,
  started: false,
  computed: false,
  newParams: new Uint8Array(),
  uploaded: false,
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

const DoComputation = (wasm: any, params: Uint8Array, entropy: Buffer) => new Promise<Uint8Array>((resolve, reject) => {
  try {
    const newParams = wasm.contribute(params, entropy);
    console.log('Updated params', newParams);
    resolve(newParams);
  } catch (err) {
    reject(err);
  }
});

const welcomeText = (
  <Typography variant="body1">
  Welcome to zkparty. This page will allow you to participate in the ceremony. Click to your commence your contribution. 
  </Typography>);

enum Step {
  NOT_ACKNOWLEDGED,
  ACKNOWLEDGED,
  INITIALISED,
  ENTROPY_COLLECTED,
  WAITING,
  RUNNING,
}

const stepText = (step: string) => (<Typography>{step}</Typography>);

export const ParticipantSection = () => {
  const [step, setStep] = React.useState(Step.NOT_ACKNOWLEDGED);
  const [loading, setLoading] = React.useState(false);
  const [wasm, setWasm] = React.useState<any | null>(null);
  const [data, setData] = React.useState<Uint8Array | null>(null);
  const [entropy, setEntropy] = React.useState(new Uint8Array(64));
  const [computeStatus, setComputeStatus] = React.useState<ComputeStatus>(initialComputeStatus);
  const [participant, setParticipant] = React.useState<Participant | null>(null);
  const [contributionState, setContributionState] = React.useState<ContributionState | null>(null);
  //const [ceremonyId, setCeremonyId] = React.useState<string | null>(null);
  const Auth = React.useContext(AuthContext);
  //const [index, setIndex] = React.useState(1);
  //const ceremonyId = "Qiu6eLsJDyMokvJ7sGzH";
  const index = 1;

  const getParticipant = async () => {
    console.log(`uid: ${Auth.authUser.uid}`);
    let p: Participant = newParticipant(Auth.authUser.uid);
    setParticipant(p);
    await addOrUpdateParticipant(p);
  };

  const loadWasm = async () => {
    try {
      if (!loading) {
        setLoading(true);
        // ignore syntax check error. Make sure to *npm link* phase2 in ../lib/pkg
        const wasm = await import('phase2');
        setWasm(wasm);
        console.log('wasm set');
      }
    } finally {
      setLoading(false);
    }
  };

  const getEntropy = () => {
    const s = entropy.map((v, i) => Math.random() * 256);
    console.log(`entropy set`);
    setEntropy(s);
    return s;
  };

  const setContribution = (cs: ContributionState) => {
    // Only accept new tasks if we're waiting
    if (step === Step.WAITING) {
      setContributionState(cs);
      setStep(Step.RUNNING);
    }
  }

  const compute = async () => {
    const { running, downloaded, started, computed, uploaded, newParams } = computeStatus;
    console.log(`compute step: ${running? 'running' : '-'} ${running && downloaded && !computed ? 'computing': running && computed && !uploaded ? 'uploaded' : 'inactive'}`);
    if (running && contributionState && contributionState.ceremony.id) {
      if (!downloaded) {
        const paramData = await GetParamsFile(contributionState.ceremony.id, index);
        addCeremonyEvent(contributionState.ceremony.id, CreateCeremonyEvent( "PARAMS_DOWNLOADED", `Parameters from participant ${index} downloaded OK`));
        console.log('Source params', paramData);
        setData(paramData);
        setComputeStatus({...computeStatus, downloaded: true});
      }
      if (downloaded && !computed) {
        if (!started) {
          console.log('running computation......');
          if (data) {
            DoComputation(wasm, data, Buffer.from(getEntropy())).then(async (newParams) => {
              console.log('DoComputation finished');
              await addCeremonyEvent(contributionState.ceremony.id, CreateCeremonyEvent(
                "COMPUTE_CONTRIBUTION", 
                `Contribution for participant ${index + 1} completed OK`
              ));
              setComputeStatus({...computeStatus, computed: true, newParams});
          })};
          setComputeStatus({...computeStatus, started: true});
        }
      }
      if (computed && !uploaded) {
        try {
          const newIndex = index+1;
          const paramsFile = await UploadParams(contributionState.ceremony.id, newIndex, newParams);
          // Add event to notify status and params file name
          await addCeremonyEvent(contributionState.ceremony.id, CreateCeremonyEvent(
            "PARAMS_UPLOADED", 
            `Parameters for participant ${newIndex} uploaded to ${paramsFile}`
          ));
          const contribution = CreateContributionSummary( participant ? participant.uid : '??', "COMPLETE", paramsFile, newIndex, '???hash');
          await addOrUpdateContribution(contributionState.ceremony.id, contribution);
        } finally {
          setComputeStatus({...computeStatus, running: false, uploaded: true, newParams: new Uint8Array()});
          //setCeremonyId(null);
          setContributionState(null);
          setStep(Step.WAITING);
        }
      }
    }
  }; 

  let content = (<></>);
  if (!Auth.isLoggedIn) {
    content = (<Typography>Sorry, please login to access this page</Typography>);
  } else {
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
      if (!participant) getParticipant();
      loadWasm().then(() =>     
        setStep(Step.INITIALISED)
      );
      content = stepText('Loading compute module...');
      break;
    }
    case (Step.INITIALISED): {
      // Collect entropy
      getEntropy();
      content = stepText('Collecting ewntropy...');
      setStep(Step.ENTROPY_COLLECTED);
      break;
    }
    case (Step.ENTROPY_COLLECTED): {
      // start looking for a ceremony to contribute to
      if (participant) ceremonyContributionListener(participant.uid, setContribution);
      content = stepText('Starting listener...');
      setStep(Step.WAITING);
      break;
    }
    case (Step.WAITING): {
      // Waiting for a ceremony
      if (!computeStatus.running && contributionState) {
        console.log(`contribution state: ${JSON.stringify(contributionState)}`);
        if (contributionState.status === "WAITING") {
          console.log('ready to go');
          //setCeremonyId(contributionState.ceremony.id);
          setComputeStatus({...initialComputeStatus, running: true });
        }
      }
    
      content = stepText('Waiting...');
      break;
    }
    case (Step.RUNNING): {
      // We have a ceremony to contribute to. Download parameters

      // Compute

      // Upload
      compute();

      content = (<><CircularProgress />{
           !computeStatus.downloaded ? stepText('Downloading ...') 
         : !computeStatus.computed ? stepText('Calculating ...')
         : stepText('Uploading ...') 
      }</>);
      break;
    }
  }};

  //const run = () => {
  //  setComputeStatus({...initialComputeStatus, running: true });
  //};

  // const serviceWorker = () => { 
  //   navigator.serviceWorker.ready.then(() => {
  //     console.log('service worker ready');
  //     navigator.serviceWorker.controller?.postMessage({type: 'LOAD_WASM'});
  //     navigator.serviceWorker.addEventListener('message', event => {
  //       console.log(`message from service worker ${event.data.type}`);
  //     });
  //   });
  // };

  //serviceWorker();

  return (
      <div style={{ width: "512px" }}>
        {content}

      </div>
  );
};
