import * as React from 'react';
import { useState, useEffect, useContext, } from "react";
import {
    NormalBodyText,
    PanelTitle,
  } from "../styles";
import { ComputeDispatchContext, ComputeStateContext } from '../state/ComputeStateManager';
import { startCircuitEventListener, startCircuitListener } from '../state/Circuits';
import { AuthStateContext } from '../state/AuthContext';
import CircuitsTable from './CircuitsTable';

const tableText = (isLoggedIn: boolean, circuitLength: number) => {
  return (
    isLoggedIn ?
     (`Your participation in the ceremony involves contributing a computation
     to ${circuitLength} different circuits. More complex circuits take longer
     to run and you may have to wait if someone before you is completing a computation.
      Your hash is the signature of your contribution.`
     )
    :
     (`All participants will contribute a computation to ${circuitLength} different circuits. There is no limit
     to the number of contributions each circuit can accept - The more the merrier!
     Participants receive a hash for each completed circuit, which acts as a signature of
     their contribution`)
  );
}

export default function CircuitsPanel() {
  const state = useContext(ComputeStateContext);
  const dispatch = useContext(ComputeDispatchContext);
  const authState = useContext(AuthStateContext);
  const [loaded, setLoaded] = useState(false);
  const [viewWidth, setViewWidth] = useState(window.innerWidth);

  const { circuits, project, projectId } = state;
  const { isLoggedIn, } = authState;

  useEffect(() => {
    if (!loaded && projectId && dispatch) {
      // Get circuits. Listen for updates
      startCircuitListener(projectId, dispatch);
      startCircuitEventListener(dispatch);
      setLoaded(true);
    }
  }, [loaded, projectId]);

  useEffect(() => {
    const handleResize = () => setViewWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [])


  return (
    <div style={{
      alignSelf: viewWidth < 500 ? 'flex-start' : 'center',
      display: 'flex',
      flexDirection: 'column',
      marginLeft: '16px',
      marginRight: '16px',
      minWidth: '500px'
    }}>
      <PanelTitle style={{
         paddingBottom: '6px',
      }}>
        {`Circuits`}
      </PanelTitle>
      <NormalBodyText
        style={{
          maxWidth: viewWidth < 800 ? 'calc(100vw - 32px)' : '800px',
          paddingBottom: '64px'
        }}>
        {tableText(isLoggedIn, circuits.length)}
      </NormalBodyText>
      <CircuitsTable isLoggedIn={isLoggedIn} circuits={circuits} />
    </div>
  )
};
