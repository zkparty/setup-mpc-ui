import * as React from 'react';
import { useState, useEffect, Fragment, useContext } from "react";
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
import { Button, withStyles, Typography } from '@material-ui/core';
import { ComputeDispatchContext, ComputeStateContext } from '../state/ComputeStateManager';
import styled from 'styled-components';

const ceremonyProject = 'zkopru';
const CopyIcon = () => {return (<img src='./Copy Icon.svg' />)};

const StyledTable = withStyles({
  root: {
    color: textColor,
    backgroundColor: darkerBackground,
  },
})(Table);

const StyledCell = styled(TableCell)`
  .head: {
    color: ${textColor};
  }

  .root: {
    height: 53px;
    border: 1px solid ${darkBorder};
  }
`;

const StyledRow = styled(TableRow)`
  .head: {
    color: ${textColor};
  }

  .root: {
    color: ${(props: { completed: boolean; }) => props.completed ? accentColor : textColor};
    height: 53px;
    border: 1px solid ${darkBorder};
  }
`;

export default function CircuitsTable(props: any) {
  const state = useContext(ComputeStateContext);
  const dispatch = useContext(ComputeDispatchContext);
  const [loaded, setLoaded] = useState(false);
  //const classes = useStyles();
  console.debug(`render circuits table`);

  const { circuits, participant } = state;

  const isSignedIn = (participant instanceof Object);

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

  return (
    <TableContainer component='div' style={{ width: '778px' }}>
      <Typography variant='h2' style={{
         fontFamily: 'Inconsolata',
         fontWeight: 'bold', 
         fontSize: '48px' , 
         color: textColor, 
         height: '100px',
         paddingBottom: '6px',
      }}>
        {`${ceremonyProject} circuits`}
      </Typography>
      <NormalBodyText style={{ 
        paddingBottom: '64px',
        }}>
        {`All participants will contribute a computation to ${circuits.length} different circuits. There is no limit
        to the number of contributions each circuit can accept - The more the merrier! 
        Participants receive a hash for each completed circuit, which acts as a signature of 
        their contribution`}
      </NormalBodyText>
      <StyledTable size="small" aria-label="circuits table" >
        <TableHead>
          <TableRow>
            <StyledCell style={{ width: '105px' }}>Circuit</StyledCell>
            <StyledCell style={{ width: '167px' }} align="center">Contributions</StyledCell>
            <StyledCell style={{ width: '156px' }} align="center">Average Time</StyledCell>
            <StyledCell style={{ width: '157px' }} align="center">Transcript</StyledCell>
            {isSignedIn ? 
              (<StyledCell style={{ width: '193px' }} align="center">My Hash</StyledCell>) :
              (<></>)
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {circuits.map((circuit, index) => 
            renderRow(circuit, index+1, isSignedIn)
          )}
        </TableBody>
      </StyledTable>
    </TableContainer>    
    )
  };

  const renderRow = (circuit: any, index: number, isSignedIn: boolean) => {

    const showTranscript = (transcript: string) => {
      return (<>{transcript}</>);
    };

    const renderHash = (hash: string) => {
      return (
        <div>
          <NormalBodyText>{`${hash.substr(0,3)}...${hash.substr(-3)}`}</NormalBodyText>
          <CopyIcon />
        </div>
      );
    };


    return (
      <StyledRow key={index} completed={circuit.completed}>
        <StyledCell align='left' >{index}</StyledCell>
        <StyledCell component="th" align='left' >
          {circuit.complete}
        </StyledCell>
        <StyledCell align="left">{circuit.averageDuration}</StyledCell>
        <StyledCell align="center">
          <Button style={{ color: textColor }} onClick={() => showTranscript(circuit.transcript)}>View</Button>
        </StyledCell>
        {isSignedIn ? 
          <StyledCell align="left">{renderHash(circuit.hash)}</StyledCell> : <></>}
      </StyledRow>
    );
  }
