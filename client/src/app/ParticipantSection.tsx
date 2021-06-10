import React, { Dispatch, useContext, useEffect, useRef } from "react";
import Typography from "@material-ui/core/Typography";
import { AuthContextInterface, AuthStateContext } from "../state/AuthContext";

import { Ceremony, Participant } from "../types/ceremony";

import { 
  ceremonyQueueListener, ceremonyQueueListenerUnsub, getSiteSettings, joinCircuit } from "../api/FirestoreApi";
import { newParticipant, Step, ComputeStateContext, ComputeDispatchContext, ComputeContextInterface } from '../state/ComputeStateManager';
import { getContributions, startWorkerThread } from "../state/Compute";
import { createSummaryGist } from "../api/ZKPartyApi";
import WelcomePanel from "../components/WelcomePanel";
import ProgressPanel from "../components/ProgressPanel";
import LoginPanel from "../components/LoginPanel";

const stepText = (step: string) => (<Typography align="center">{step}</Typography>);

const handleStepChange = (state: ComputeContextInterface, 
    dispatch: Dispatch<any> | undefined,
    authState: AuthContextInterface
  ) => {

  const { step, computeStatus, participant, contributionState, circuits, joiningCircuit, worker } = state;
  console.debug(`handle step change ${step}`);
  switch (step) {
      case (Step.ACKNOWLEDGED): {
        // After 'LAUNCH' clicked
        // Display status messages for all remaining conditions
        // Initialise - get participant ID, load wasm module
        if (dispatch) {
          getSiteSettings().then(
            settings => {
              dispatch({ type: 'SET_SETTINGS', data: settings });
          });

          if (!participant && dispatch) {
            getParticipant(dispatch, authState).then(() => {
              console.debug('participant set');
              //dispatch({type: 'SET_STEP', data: Step.INITIALISED});
            });
            // TODO - snarkjs - no load required ??
            //if (!worker) startWorkerThread(dispatch);
          }
        }
        break;
      }
      case (Step.INITIALISED): {
        if (dispatch) joinNewCircuit(dispatch, circuits, participant, joiningCircuit, authState);
        break;
      }
      case (Step.ENTROPY_COLLECTED): {
        if (dispatch) dispatch({ type: 'WAIT' });
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
        break;
      }
  };
};

const joinNewCircuit = (
  dispatch: Dispatch<any>, 
  circuits: Ceremony[],
  participant: Participant | undefined,
  joiningCircuit: boolean = false,
  authState: AuthContextInterface,
  ) => {


  const updateQueue = (update: any) => {
    console.debug(`queue update ${JSON.stringify(update)} `);
    // Sanity check - only continue if lastValidIndex > 0
    // Coordinator excepted
    if (update.lastValidIndex > 0 || authState.isCoordinator) {
      if (dispatch) dispatch({
        type: 'UPDATE_QUEUE',
        data: update,
        unsub: ceremonyQueueListenerUnsub,
      });
    } else {
      console.warn(`lastValidIndex is 0. Queue update not accepted`);
    }
  }
  
  console.debug(`joinCircuit ${joiningCircuit}`);
  const newCircuit = advanceCircuit(circuits);
  console.debug(`new circuit is ${newCircuit?.id}`);
  // If no more, mark end of ceremony
  if (!newCircuit) {
    dispatch({ type: 'END_OF_SERIES' });
  } else if (participant) {
    // Else, get/make contribution record for new ceremony.
    // Must be called only once
    if (!joiningCircuit) {
      console.debug(`joining circuit`);
      joinCircuit(newCircuit.id, participant.uid).then(cs => {
        // Coordinator excepted
        console.debug(`joined circuit. queue index ${cs ? cs.queueIndex : '-'}`);
        if (!cs) {
          // DB says user has already done this circuit - refresh
          getContributions(authState.authUser.uid, dispatch, authState.isCoordinator);
        } else {
          // Have new contribution and queue index
          dispatch({
            type: 'SET_CEREMONY',
            data: cs,
          });
          ceremonyQueueListener(newCircuit.id, updateQueue);
        }
      });
      dispatch({ type: 'JOINING_CIRCUIT' });
    }
  };
};

const getParticipant = async (dispatch: Dispatch<any>, authState: AuthContextInterface) => {
  console.log(`uid: ${authState.authUser.uid} acc.token ${authState.accessToken}`);
  dispatch({
    type: 'SET_PARTICIPANT',
    data: newParticipant(authState.authUser.uid, authState.authUser.additionalUserInfo?.username),
    accessToken: authState.accessToken });
  // Trigger contribution count for this user
  await getContributions(authState.authUser.uid, dispatch, authState.isCoordinator);
};

const advanceCircuit = (circuits: Ceremony[]) => {
  // Get the next circuit to be completed.
  // Return the ceremonyId, or null if they're all done
  return circuits.find(cct => !cct.isCompleted);
}


export const ParticipantSection = () => {
  const state = useContext(ComputeStateContext);
  const dispatch = useContext(ComputeDispatchContext);
  const authState = useContext(AuthStateContext);
  const summaryStarted = useRef<boolean>(false);

  const { step, computeStatus, participant, contributionState, circuits, 
    joiningCircuit, worker, seriesIsComplete, userContributions, summaryGistUrl, } = state;

  useEffect(() => {
    handleStepChange(state, dispatch, authState);
  },[step, participant, computeStatus, contributionState, circuits, joiningCircuit, worker, authState, dispatch]);

  useEffect(() => {
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
  },
  [seriesIsComplete, userContributions, summaryGistUrl, summaryStarted.current, dispatch]
  );

  const logState =  () => {
    const { running,  downloaded,  computed,  uploaded } = computeStatus;
    console.log(`compute step: ${running? 'running' : '-'
    } ${running && !downloaded  ? 'downloading' :
        running && downloaded && !computed ? 'computing' :
        running && computed && !uploaded ? 'uploading' :
        'inactive'}`);
  };

  let content = (<></>);
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
        content = stepText('Loading compute module...');
        break;
      }
      case (Step.INITIALISED):
      case (Step.ENTROPY_COLLECTED): 
      case (Step.WAITING): 
      case (Step.QUEUED): 
      case (Step.RUNNING): 
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
