import { Ceremony } from "../types/ceremony";

import { Dispatch, useContext } from "react";
import { circuitEventListener, getCeremonies } from '../api/FirestoreApi';

export const startCircuitListener = (project: string, dispatch: Dispatch<any>) => {

  getCeremonies(project).then(circuits => {
    if (dispatch) {
      dispatch({
        type: 'SET_CIRCUITS',
        data: circuits,
      })
  }});
  console.debug('circuits getter started');
}

export const startCircuitEventListener = (dispatch: Dispatch<any>) => {

  const updateCircuit = (circuit: Ceremony) => {
    // Called when circuit verified.
    // Increment complete count. Refresh verification transcript
    console.debug(`circuit verified ${circuit.id}`);
    if (dispatch) {
      dispatch({
        type: 'INCREMENT_COMPLETE_COUNT',
        data: circuit.id,
      });
    }
  }

  return circuitEventListener(updateCircuit);
}

