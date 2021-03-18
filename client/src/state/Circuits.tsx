import * as React from 'react';
import { getParamsFile, uploadParams } from "../api/FileApi";
import { Ceremony } from "../types/ceremony";

import { Dispatch, useContext } from "react";
import { ComputeDispatchContext } from './ComputeStateManager';
import { ceremonyListener, getParticipantContributions } from '../api/FirestoreApi';

export const startCircuitListener = (dispatch: Dispatch<any>) => {

  const updateCircuit = (circuit: Ceremony) => {
    //console.log(`${ceremony}`);
    if (dispatch) {
        dispatch({
            type: 'UPDATE_CIRCUIT',
            data: circuit,
        })
    }
  };

  ceremonyListener(updateCircuit);
  console.debug('circuit listener started');
}
