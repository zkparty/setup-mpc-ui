import * as React from 'react';
import { useState, useEffect, Fragment, useContext, useRef } from "react";
import {
    accentColor,
    secondAccent,
    textColor,
    PageContainer,
    lighterBackground,
    SectionContainer,
    CeremonyTitle,
    darkBorder,
    NormalBodyText,
    darkerBackground,
    gray1,
    PanelTitle,
  } from "../styles";
//import './styles.css';
import TableContainer from '@material-ui/core/TableContainer';
import { Button, withStyles } from '@material-ui/core';
import { ComputeDispatchContext, ComputeStateContext } from '../state/ComputeStateManager';
import styled from 'styled-components';
import { startCircuitEventListener, startCircuitListener } from '../state/Circuits';
import { AuthStateContext } from '../state/AuthContext';
import CircuitsTable from './CircuitsTable';

const ceremonyProject = 'zkopru';

export default function CircuitsPanel(props: any) {
  const state = useContext(ComputeStateContext);
  const dispatch = useContext(ComputeDispatchContext);
  const authState = useContext(AuthStateContext);
  const [loaded, setLoaded] = useState(false);
  //console.debug(`render circuits table`);

  const { circuits } = state;
  const { isLoggedIn, authUser, } = authState;

  useEffect(() => {
    if (!loaded && dispatch) {
      // Get circuits. Listen for updates
      startCircuitListener(dispatch);
      startCircuitEventListener(dispatch);
      setLoaded(true);
    }
  }, [loaded]);

  return (
    <TableContainer component='div' style={{ width: '778px' }}>
      <PanelTitle style={{ 
         height: '100px',
         paddingBottom: '6px',
      }}>
        {`${ceremonyProject} circuits`}
      </PanelTitle>
      <NormalBodyText style={{ paddingBottom: '64px', }}>
        {`All participants will contribute a computation to ${circuits.length} different circuits. There is no limit
        to the number of contributions each circuit can accept - The more the merrier! 
        Participants receive a hash for each completed circuit, which acts as a signature of 
        their contribution`}
      </NormalBodyText>
      <CircuitsTable isLoggedIn={isLoggedIn} circuits={circuits} />
    </TableContainer>
    )
  };
