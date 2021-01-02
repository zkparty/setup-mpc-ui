import React, { useReducer } from "react";
import styled, { css } from "styled-components";
import Typography from "@material-ui/core/Typography";
import { AuthContext } from "../app/AuthContext";

import {
  accentColor,
  secondAccent,
  textColor,
  PageContainer,
  lighterBackground,
} from "../styles";
import { ContributionState } from "./../types/ceremony";
import Button from "@material-ui/core/Button";
import VirtualList from "./../components/MessageList";
import Paper from "@material-ui/core/Paper";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import { addOrUpdateParticipant, ceremonyContributionListener, 
  ceremonyQueueListener, ceremonyQueueListenerUnsub } from "../api/FirestoreApi";
import QueueProgress from './../components/QueueProgress';
import Divider from "@material-ui/core/Divider";
import { LinearProgress } from "@material-ui/core";
import { newParticipant, computeStateReducer, Step, startServiceWorker, initialState, loadWasm } from './ComputeStateManager';

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

const welcomeText = (
  <Typography variant="body1" align="center">
  Welcome to zkparty. This page will allow you to participate in a ceremony. Click to your commence your contribution. 
  </Typography>);


const stepText = (step: string) => (<Typography align="center">{step}</Typography>);

const queueProgressCard = (contrib: ContributionState) => {
  return (
  <QueueProgress 
    {...contrib}
  >
  </QueueProgress>
)};

export const ParticipantSection = () => {
  const [state, dispatch] = useReducer(computeStateReducer, initialState);
  const Auth = React.useContext(AuthContext);
  const classes = useStyles();

  const { step, computeStatus, messages, entropy, participant, contributionState } = state;
  
  const getParticipant = async () => {
    console.log(`uid: ${Auth.state.authUser.uid}`);
    dispatch({ 
      type: 'SET_PARTICIPANT', 
      data: newParticipant(Auth.state.authUser.uid), 
      accessToken: Auth.state.accessToken });
  };

  const getEntropy = () => {
    dispatch({type: 'SET_ENTROPY', data: new Uint8Array(64).map(() => Math.random() * 256)});
    console.debug(`entropy set`);
  };

  const addMessage = (msg: string) => {
    dispatch({type: 'ADD_MESSAGE', message: msg});
  }

  const handleClick = () => {
    dispatch({type: 'SET_STEP', data: Step.ACKNOWLEDGED, dispatch});
  }
  
  const setContribution = (cs: ContributionState) => {
    // Only accept new tasks if we're waiting
    if (step !== Step.RUNNING && step !== Step.QUEUED) {
      dispatch({
        type: 'SET_CEREMONY',
        data: cs,
      });
      ceremonyQueueListener(cs.ceremony.id, updateQueue);
    } else {
      console.log(`Contribution candidate received while running another. ${step}`);
    }
  }

  const updateQueue = (update: any) => {
    dispatch({
      type: 'UPDATE_QUEUE',
      data: update,
      unsub: ceremonyQueueListenerUnsub,
    });
  }
  
  const logState =  () => {
    const { running,  downloaded,  computed,  uploaded } = computeStatus;
    console.log(`compute step: ${running? 'running' : '-' 
    } ${running && !downloaded  ? 'downloading' :
        running && downloaded && !computed ? 'computing' : 
        running && computed && !uploaded ? 'uploading' : 
        'inactive'}`);
  }; 

  let content = (<></>);
  if (!Auth.state.isLoggedIn) {
    content = (<Typography variant='body1'>Sorry, please login to access this page</Typography>);
  } else {
    console.debug(`step ${step.toString()}`);
    switch (step) {
      case (Step.NOT_ACKNOWLEDGED): {
        // Display welcome text until the 'go ahead' button is clicked.
        content = (<div>{welcomeText}<Acknowledge contribute={handleClick} /></div>);
        break;
      }
      case (Step.ACKNOWLEDGED): {
        // After 'go ahead' clicked
        // Display status messages for all remaining conditions
        // Initialise - get participant ID, load wasm module
        if (!participant) {
          getParticipant().then(() => {
            console.debug('INITIALISED');
            dispatch({type: 'SET_STEP', data: Step.INITIALISED});
          });
        }
        content = stepText('Loading compute module...');
        break;
      }
      case (Step.INITIALISED): {
        // Collect entropy
        if (entropy.length == 0) getEntropy();
        content = stepText('Collecting entropy...');
        dispatch({type: 'SET_STEP', data: Step.ENTROPY_COLLECTED});
        break;
      }
      case (Step.ENTROPY_COLLECTED): {
        // start looking for a ceremony to contribute to
        if (participant) ceremonyContributionListener(participant.uid, Auth.state.isCoordinator, setContribution);
        content = stepText('Starting listener...');
        addMessage('Initialised.');
        dispatch({type: 'SET_STEP', data: Step.WAITING});
        break;
      }
      case (Step.WAITING): {
        // Waiting for a ceremony      
        content = stepText('No ceremonies are ready to accept your contribution at the moment.');
        break;
      }
      case (Step.QUEUED): {
        // Waiting for a ceremony
        if (contributionState) {
          console.debug(`contribution state: ${JSON.stringify(contributionState)}`);
          content = queueProgressCard(contributionState);
        }      
        break;
      }
      case (Step.RUNNING): {
        // We have a ceremony to contribute to. 
        // Download/Compute/Upload
        logState();

        if (computeStatus.ready && !computeStatus.running) {
          // Start the computation
          dispatch({
            type: 'START_COMPUTE',
            ceremonyId: contributionState.ceremony.id,
            index: contributionState.queueIndex,
            dispatch,
          });          
        }

        const progressPct = state.progress.total > 0 ? 100 * state.progress.count / state.progress.total : 0;

        content = (<><Typography variant='h3'>{
            !computeStatus.downloaded ? stepText('Downloading ...')
          : !computeStatus.computed ? stepText('Calculating ...')
          : stepText('Uploading ...') 
        }</Typography>
        <LinearProgress variant="determinate" value={progressPct} /></>);
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
