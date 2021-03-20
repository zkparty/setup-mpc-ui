import * as React from 'react';
import { getParamsFile, uploadParams } from "../api/FileApi";
import { Ceremony } from "../types/ceremony";

import { Dispatch, useContext } from "react";
import { ceremonyListener, circuitEventListener, getParticipantContributions } from '../api/FirestoreApi';

export const startCircuitListener = (dispatch: Dispatch<any>) => {

  const updateCircuit = (circuit: Ceremony) => {
    //console.log(`${ceremony}`);
    if (dispatch) {
        dispatch({
            type: 'UPDATE_CIRCUIT',
            data: circuit,
        });
    }
  };

  ceremonyListener(updateCircuit);
  console.debug('circuit listener started');
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

