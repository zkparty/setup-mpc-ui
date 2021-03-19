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
import {CopyToClipboard} from 'react-copy-to-clipboard';
import ViewLog from './ViewLog';
import { startCircuitListener } from '../state/Circuits';
import moment from 'moment';
import { CopyIcon } from '../icons';

const ceremonyProject = 'zkopru';

const StyledCell = withStyles({
  root: {
    color: 'inherit',
    height: '53px',
    border: `1px solid ${darkBorder}`,
  }
})(TableCell);

const StyledTable = styled(Table)`
  .root: {
    color: ${textColor};
    background-color: ${darkerBackground};
  }

`;


const StyledRow = styled.tr`
  color: ${(props: { completed?: boolean; }) => props.completed ? accentColor : textColor};
  height: 53px;
  border: 1px solid ${darkBorder};

  .head: {
    color: ${textColor};
  }

`;

export default function CircuitsTable(props: any) {
  const state = useContext(ComputeStateContext);
  const dispatch = useContext(ComputeDispatchContext);
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  console.debug(`render circuits table`);

  const { circuits, participant } = state;

  const isSignedIn = (participant instanceof Object);

  useEffect(() => {
    if (!loaded && dispatch) {
      // Subscribe to ceremony updates
      startCircuitListener(dispatch);
      setLoaded(true);
    }
  }, [loaded]);

  const closeTranscript = () => {setModalOpen(false)};
  const openTranscript = (content: string) => {
    setModalContent(content || 'nothing');
    setModalOpen(true);
  }

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
          <StyledRow>
            <StyledCell style={{ width: '105px' }}>Circuit</StyledCell>
            <StyledCell style={{ width: '167px' }} align="center">Contributions</StyledCell>
            <StyledCell style={{ width: '156px' }} align="center">Average Time</StyledCell>
            <StyledCell style={{ width: '157px' }} align="center">Transcript</StyledCell>
            {isSignedIn ? 
              (<StyledCell style={{ width: '193px' }} align="center">My Hash</StyledCell>) :
              (<></>)
            }
          </StyledRow>
        </TableHead>
        <TableBody>
          {circuits.map((circuit, index) => 
            renderRow(circuit, index+1, isSignedIn, openTranscript)
          )}
        </TableBody>
      </StyledTable>
      <ViewLog 
        open={modalOpen} 
        close={closeTranscript} 
        content={modalContent} 
        title={`Transcript`} />
    </TableContainer>
    )
  };

  const renderRow = (circuit: any, index: number, isSignedIn: boolean, showTranscript: (c: string) => void) => {

    const renderHash = (hash: string) => {
      let content = (<></>);
      if (hash && hash.length > 0) {
        content = (
          <CopyToClipboard text={hash} >
            <span style={{ display: 'flex', justifyContent: 'space-evenly', }}>
              <NormalBodyText style={{ color: 'inherit', fontSize: '18px' }}>{`${hash.substr(0,3)}...${hash.substr(-3)}`}</NormalBodyText>
              {CopyIcon}
            </span>
          </CopyToClipboard>
        );
      }
      return (<span>{content}</span>);
    };

    const formatDuration = (avgSecs: number) => {
      return moment.duration(avgSecs, 'seconds').humanize();
    }

    return (
      <StyledRow key={index} completed={circuit.completed} >
        <StyledCell align='left' >{index}</StyledCell>
        <StyledCell component="th" align='left' >
          {circuit.complete}
        </StyledCell>
        <StyledCell align="left">{formatDuration(circuit.averageSecondsPerContribution)}</StyledCell>
        <StyledCell align="center">
          <Button style={{ 
            color: 'inherit', 
            font: 'Inconsolata 18px', 
            textTransform: 'none',
            textDecoration: 'underline', }}
           onClick={() => showTranscript(circuit.transcript)}>
            View
          </Button>
        </StyledCell>
        {isSignedIn ? 
          <StyledCell align="left">
            {renderHash(circuit.hash)}
          </StyledCell> : 
          <></>
        }
      </StyledRow>
    );
  }
