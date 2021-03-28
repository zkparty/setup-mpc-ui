import React, { Dispatch, useContext, useReducer, useRef } from "react";
import Typography from "@material-ui/core/Typography";
import { AuthStateContext } from "../state/AuthContext";

import {
  accentColor,
  secondAccent,
  textColor,
  PageContainer,
  lighterBackground,
} from "../styles";
import { ContributionState } from "../types/ceremony";
import Paper from "@material-ui/core/Paper";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import { ceremonyContributionListener,
  ceremonyQueueListener, ceremonyQueueListenerUnsub, getParticipantContributions, getSiteSettings } from "../api/FirestoreApi";
import Divider from "@material-ui/core/Divider";
import { Box, IconButton } from "@material-ui/core";
import { newParticipant, Step, ComputeStateContext, ComputeDispatchContext } from '../state/ComputeStateManager';
import { getContributions, startWorkerThread } from "../state/Compute";
import { createSummaryGist } from "../api/ZKPartyApi";
import WelcomePanel from "../components/WelcomePanel";
import ProgressPanel from "../components/ProgressPanel";
import LoginPanel from "../components/LoginPanel";

const stepText = (step: string) => (<Typography align="center">{step}</Typography>);

export const ParticipantSection = () => {
  const state = useContext(ComputeStateContext);
  const dispatch = useContext(ComputeDispatchContext);
  const authState = useContext(AuthStateContext);
  const ceremonyListenerUnsub = useRef<(() => void) | null>(null);
  const summaryStarted = useRef<boolean>(false);

  const { step, computeStatus, entropy, participant, contributionState } = state;

  const getParticipant = async () => {
    console.log(`uid: ${authState.authUser.uid} acc.token ${authState.accessToken}`);
    if (dispatch) {
      dispatch({
        type: 'SET_PARTICIPANT',
        data: newParticipant(authState.authUser.uid, authState.authUser.additionalUserInfo?.username),
        accessToken: authState.accessToken });
      // Trigger contribution count for this user
      getContributions(authState.authUser.uid, dispatch);
    }
  };

  const getEntropy = () => {
    if (dispatch) dispatch({type: 'SET_ENTROPY', data: new Uint8Array(64).map(() => Math.random() * 256)});
    console.debug(`entropy set`);
  };

  const addMessage = (msg: string) => {
    if (dispatch) dispatch({type: 'ADD_MESSAGE', message: msg});
  }

  const setContribution = (cs: ContributionState | boolean) => {
    if (ceremonyListenerUnsub.current) ceremonyListenerUnsub.current();

    if (!cs) {
      // Query is telling us that all circuits have been run.
      if (dispatch) dispatch({ type: 'END_OF_SERIES' });
    } else if (cs instanceof Object) {
      // New circuit to contribute to
      // Only accept new tasks if we're waiting
      if (step !== Step.RUNNING && step !== Step.QUEUED) {
        if (dispatch) dispatch({
          type: 'SET_CEREMONY',
          data: cs,
        });
        ceremonyQueueListener(cs.ceremony.id, updateQueue);
      } else {
        console.log(`Contribution candidate received while running another. ${step}`);
      }
    }
  }

  const updateQueue = (update: any) => {
    if (dispatch) dispatch({
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
  // Handle end of series
  if (state.seriesIsComplete && state.userContributions && state.userContributions.length>0 && !state.summaryGistUrl && !summaryStarted.current) {
      summaryStarted.current = true;
      // Add a gist
      const { userContributions, siteSettings, participant, accessToken } = state;
      if (participant && participant.authId && accessToken) {
        createSummaryGist(siteSettings, userContributions, participant.authId, accessToken).then(
          url => {
            if (dispatch) dispatch({ type: 'SUMMARY_GIST_CREATED', data: url });
        })
      }
  }

  if (!authState.isLoggedIn) {
    content = (<LoginPanel />);
  } else {
    //console.debug(`step ${step.toString()}`);
    switch (step) {
      case (Step.NOT_ACKNOWLEDGED): {
        // Display welcome text until the 'go ahead' button is clicked.
        content = (<WelcomePanel />);
        break;
      }
      case (Step.ACKNOWLEDGED): {
        // After 'LAUNCH' clicked
        // Display status messages for all remaining conditions
        // Initialise - get participant ID, load wasm module
        if (dispatch) {
          getSiteSettings().then(
            settings => {
              dispatch({ type: 'SET_SETTINGS', data: settings });
          });

          if (!participant) {
            getParticipant().then(() => {
              console.debug('INITIALISED');
              dispatch({type: 'SET_STEP', data: Step.INITIALISED});
            });
            if (!state.worker) startWorkerThread(dispatch);
          }
        }

        content = stepText('Loading compute module...');
        break;
      }
      case (Step.INITIALISED): {
        // Collect entropy
        if (entropy.length == 0) getEntropy();
        content = stepText('Collecting entropy...');
        if (dispatch) dispatch({type: 'SET_STEP', data: Step.ENTROPY_COLLECTED});
        break;
      }
      case (Step.ENTROPY_COLLECTED): {
        // start looking for a ceremony to contribute to
        if (participant) {
          ceremonyListenerUnsub.current = ceremonyContributionListener(participant.uid, authState.isCoordinator, setContribution);
        }
        content = stepText('Starting listener...');
        //addMessage('Initialised.');
        if (dispatch) dispatch({ type: 'WAIT' });
        break;
      }
      case (Step.WAITING): {
        // Waiting for a ceremony
        content = (<ProgressPanel />);
        break;
      }
      case (Step.QUEUED): {
        // Waiting for a circuit
        //if (contributionState) {
        //  console.debug(`contribution state: ${JSON.stringify(contributionState)}`);
        //}
        content = (<ProgressPanel />);
        break;
      }
      case (Step.RUNNING): {

        if (computeStatus.ready && !computeStatus.running && dispatch) {
          // TODO Is there a better place to raise this event?
          // Start the computation
          dispatch({
            type: 'START_COMPUTE',
            ceremonyId: contributionState?.ceremony.id,
            index: contributionState?.queueIndex,
            dispatch,
          });
        }

        content = (<ProgressPanel />);
        break;
      }
      case (Step.COMPLETE): {
        content = (<ProgressPanel />);
        break;
      }
  }};

  return (
      <div>
        {content}
      </div>
  );
};
