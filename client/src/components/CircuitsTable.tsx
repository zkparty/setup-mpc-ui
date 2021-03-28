import * as React from 'react';
import { useState } from "react";
import {
    accentColor,
    textColor,
    darkBorder,
    NormalBodyText,
    darkerBackground,
    H3Title,
  } from "../styles";
//import './styles.css';
import { Ceremony } from "../types/ceremony";
import { Button } from '@material-ui/core';
import styled from 'styled-components';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import ViewLog from './ViewLog';
import moment from 'moment';
import { CopyIcon } from '../icons';

const HeaderCell = styled.div`
  display: flex;
  flex: 1;
  min-width: 10px;
  align-items: center;
  margin: 1px;
  font-family: Inconsolata;
  font-size: 16px;
  color: inherit;
  padding: 24px;
  background-color: #0E2936;
`

const TableRow = styled.div`
  display: flex;
  width: 100%;
  color: ${(props: { completed?: boolean }) => props.completed ? accentColor: textColor};
`

export default function CircuitsTable(props: { isLoggedIn: boolean, circuits: Ceremony[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({title: (<></>), content: (<></>)});
  //console.debug(`render circuits table`);

  const { circuits, isLoggedIn } = props;

  const closeTranscript = () => {setModalOpen(false)};
  const openTranscript = (title: JSX.Element, content: JSX.Element) => {
    setModalContent({title, content});
    setModalOpen(true);
  }
  const cellWidths = [
    '105px',
    '167px',
    '156px',
    '140px',
    '193px',
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <TableRow>
        <HeaderCell style={{ maxWidth: cellWidths[0] }}>Circuit</HeaderCell>
        <HeaderCell style={{ maxWidth: cellWidths[1] }}>Contributions</HeaderCell>
        <HeaderCell style={{ maxWidth: cellWidths[2] }}>Average Time</HeaderCell>
        <HeaderCell style={{ maxWidth: cellWidths[3] }}>Transcript</HeaderCell>
        {isLoggedIn ?
          (<HeaderCell style={{ maxWidth: cellWidths[4] }}>My Hash</HeaderCell>)
          : null
        }
      </TableRow>
      {circuits.map((circuit, index) =>
        renderRow(circuit, index+1, isLoggedIn, openTranscript, cellWidths)
      )}
      <ViewLog
        open={modalOpen}
        close={closeTranscript}
        content={modalContent.content}
        title={modalContent.title}
      />
    </div>
  )
};

  const renderRow = (
    circuit: any,
    index: number,
    isSignedIn: boolean,
    showTranscript: (title: JSX.Element, body: JSX.Element) => void,
    cellWidths: string[]
  ) => {

    const renderHash = (hash: string) => {
      let content = (<></>);
      if (hash && hash.length > 0) {
        content = (
          <CopyToClipboard text={hash} >
            <span style={{ display: 'flex', justifyContent: 'space-evenly',  }}>
              <NormalBodyText style={{ color: 'inherit', fontSize: '18px' }}>
                {`${hash.substr(0,3)}...${hash.substr(-3)}`}
              </NormalBodyText>
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

    const formatTranscript = (circuit: Ceremony) => {
      const { transcript, sequence, numConstraints, circuitFileName } = circuit;

      if (!transcript) return;

      const title = (
        <div>
          <H3Title>Verification Transcript</H3Title>
          <NormalBodyText>{`Circuit ${sequence}`}</NormalBodyText>
          <NormalBodyText>{`Circuit File: ${circuitFileName}`}</NormalBodyText>
          <NormalBodyText>{`Constraints: ${numConstraints}`}</NormalBodyText>
        </div>
      );

      const lineStyle = {
        marginBlockStart: '0em',
        marginBlockEnd: '0em'
      };
      const linesToJsx = (content: string) => {
        const lines: string[] = content.split('\n');
        const body= lines.map(v =>
          (<p style={lineStyle}>{v}</p>));
        return (<div>{body}</div>);
      };

      const copyStyle = {
        display: 'flex',
        justifyContent: 'space-evenly',
        width: '245px',
        background: darkerBackground,
        borderRadius: '30px',
        marginBottom: '41px',
      };
      const body = (
        <div>
          <CopyToClipboard text={transcript} >
            <span style={copyStyle}>
              <NormalBodyText>Copy to clipboard</NormalBodyText>
              {CopyIcon}
            </span>
          </CopyToClipboard>
          {linesToJsx(transcript)}
        </div>
      );

      showTranscript(title, body);
    }

    return (
      <TableRow key={index} completed={circuit.completed}>
        <HeaderCell style={{ maxWidth: cellWidths[0] }}>{index}</HeaderCell>
        <HeaderCell style={{ maxWidth: cellWidths[1] }}>
          {circuit.complete}
        </HeaderCell>
        <HeaderCell style={{ maxWidth: cellWidths[2] }}>
        {formatDuration(circuit.averageSecondsPerContribution)}
        </HeaderCell>
        <HeaderCell style={{ maxWidth: cellWidths[3], textAlign: 'center' }}>
          <Button style={{
            color: 'inherit',
            font: 'Inconsolata 18px',
            textTransform: 'none',
            textDecoration: 'underline', }}
           onClick={() => formatTranscript(circuit)}>
            View
          </Button>
        </HeaderCell>
        {isSignedIn ?
          <HeaderCell style={{ maxWidth: cellWidths[4] }}>
            {renderHash(circuit.hash)}
          </HeaderCell> :
          <></>
        }
      </TableRow>
    );
  }
