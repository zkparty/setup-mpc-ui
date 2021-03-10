import * as React from 'react';
import { useState, useEffect, Fragment, useContext } from "react";
import {
    accentColor,
    secondAccent,
    textColor,
    PageContainer,
    lighterBackground,
    SectionContainer,
    CeremonyTitle
  } from "../styles";
//import './styles.css';
import { Ceremony } from "../types/ceremony";
import { ceremonyListener, getCeremonies, getCeremony } from "../api/FirestoreApi";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { Button, makeStyles } from '@material-ui/core';
import { ComputeDispatchContext, ComputeStateContext } from '../state/ComputeStateManager';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

export default function CircuitsTable(props: any) {
  const state = useContext(ComputeStateContext);
  const dispatch = useContext(ComputeDispatchContext);
  const [loaded, setLoaded] = useState(false);
  const classes = useStyles();
  console.debug(`render circuits table`);

  const { circuits } = state;

  const updateCircuit = (circuit: Ceremony) => {
    //console.log(`${ceremony}`);
    if (dispatch) {
      dispatch({
        type: 'UPDATE_CIRCUIT',
        data: circuit,
      })
    }
  };

  useEffect(() => {
    if (!loaded) {
      // Subscribe to ceremony updates
      ceremonyListener(updateCircuit);
      console.debug('circuit listener started');
      setLoaded(true);
    }
  }, [loaded]);

  const showTranscript = (circuit: Ceremony) => {
    return (<>{circuit.transcript}</>);
  };

  return (
    <TableContainer component='div'>
      <Table className={classes.table} size="small" aria-label="circuits table">
        <TableHead>
          <TableRow>
            <TableCell>Circuit</TableCell>
            <TableCell align="right">Contributions</TableCell>
            <TableCell align="right">Average Time</TableCell>
            <TableCell align="right">Transcript</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {circuits.map((circuit, index) => (
            <TableRow key={index+1}>
              <TableCell component="th" scope="row">
                {circuit.numParticipants}
              </TableCell>
              <TableCell align="right">{circuit.averageDuration}</TableCell>
              <TableCell align="right">
                <Button onClick={() => showTranscript(circuit)}>View</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>    
    )
  };
