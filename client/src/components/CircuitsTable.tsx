import * as React from 'react';
import { useState, useEffect, Fragment } from "react";
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
import { Button } from '@material-ui/core';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

export default function CircuitsTable(props: any) {
    const [circuits, setCircuits] = useState<Ceremony[]>([]);
    const [loaded, setLoaded] = useState(false);
    const classes = useStyles();
    console.debug(`render circuits table`);
  
    const findCircuitIndex = (id: string): number => {
      return circuits.findIndex(val => val.id === id);
    }
  
    const updateCircuit = (circuit: Ceremony) => {
      //console.log(`${ceremony}`);
      const idx = findCircuitIndex(circuit.id);
      const update = (c: Ceremony, i: number) => {
        if (i == idx) {
          console.debug(`updating ceremony ${circuit.id} ${circuit.complete}`);
          return circuit;
        } else {
          return c;
        }
      }
      if (idx >= 0) {
        setCircuits(prev => prev.map(update));
      } else {
        console.debug(`adding ceremony ${circuit.id} ${circuit.complete}`);
        setCircuits(prev => [...prev, circuit]);
      }
    };
  
    useEffect(() => {
      if (!loaded) {
        // Subscribe to ceremony updates
        ceremonyListener(updateCircuit);
        console.debug('getCeremonies done');
        setLoaded(true);
      }
    }, [loaded]);

    const showTranscript = (circuit) => {
      return (<></>);
    };
  
    return (
      <TableContainer component='div'>
      <Table className={classes.table} size="small" aria-label="circuits table">
        <TableHead>
          <TableRow>
            <TableCell>Circuit</TableCell>
            <TableCell align="right">Contributions</TableCell>
            <TableCell align="right">Target</TableCell>
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
              <TableCell align="right">{circuit.minParticipants}</TableCell>
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
