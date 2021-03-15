import { Grid, LinearProgress, Typography } from '@material-ui/core';
import * as React from 'react';
import { useContext } from 'react';
import {
  accentColor,
  secondAccent,
  textColor,
  PageContainer,
  lighterBackground,
  NormalBodyText,
} from "../styles";
import { ComputeDispatchContext, ComputeStateContext, ComputeStatus, Step } from '../state/ComputeStateManager';
import { Player } from '@lottiefiles/react-lottie-player';
import styled from 'styled-components';

const StyledHeader = styled.div`
  font-family: Inconsolata;
  font-style: normal;
  font-weight: bold;
  font-size: 48px;
  line-height: 140%;
  /* or 67px */

  display: flex;
  align-items: flex-end;

  /* Primary / Buttons */

  color: ${accentColor};
`

const stepText = (step: Step, computeStatus: ComputeStatus): string => {
  switch (step) {
    case Step.ACKNOWLEDGED: 
    case Step.INITIALISED: 
    case Step.ENTROPY_COLLECTED: {
        return 'Preparing';
    }
    case Step.QUEUED: 
    case Step.WAITING: {
        return 'Waiting';
    }
    case Step.RUNNING: {
      if (!computeStatus.downloaded) return 'Downloading'
      else if (!computeStatus.computed) return 'Computing'
      else if (!computeStatus.uploaded) return 'Uploading'
      return '?';
    }
    default: return step.toString();
  }
}

interface ProgressProps {
  progressPct: number,
}

const CeremonyProgress = ({ progressPct }: ProgressProps) => {
  return (
    <LinearProgress variant="determinate" value={progressPct} style={{ paddingTop: '20px' }} />
  );
}

const StepProgress = ({ progressPct }: ProgressProps) => {
  return (
    <LinearProgress variant="determinate" value={progressPct} style={{ paddingTop: '20px' }} />
  );
}

const Animation = () => {
  return (
    <Player autoplay
      loop
      src='./38853-circular-lines-02.json' 
      style={{ height: '419px', width: '423px' }}
      background='transparent'
    >
    </Player>
  );
}

export default function ProgressPanel(props: any) {
  const state = useContext(ComputeStateContext);
  //const dispatch = useContext(ComputeDispatchContext);

  const { circuits, contributionCount, step, computeStatus } = state;
  const cctCount = circuits.length;

  const ceremonyPct = (cctCount>0) ? contributionCount / cctCount : 0;

  return (
    <div>
      <Grid container spacing={4} direction='row' style={{ display: 'flex' }} >
        <Grid item style={{ width: '45%' }} >
          <Animation />
        </Grid>
        <Grid item container direction='column' style={{ width: '55%' }} >
          <Grid item>
            <StyledHeader>
              Contribution Active
            </StyledHeader>
          </Grid>
          <Grid item>
            <NormalBodyText>
            ATTENTION:
            </NormalBodyText>
            <br />
            <NormalBodyText>
            Closing this browser window will interrupt your contribution.
            </NormalBodyText>
          </Grid>
          <Grid item>
            <CeremonyProgress progressPct={ceremonyPct} />
          </Grid>
          <Grid item container direction='row'>
            <Grid item>
              Circuit
            </Grid>
            <Grid item>
              Status
            </Grid>
          </Grid>
          <Grid item container direction='row'>
            <Grid item>
              {contributionCount}/{cctCount}
            </Grid>
            <Grid item>
              {stepText(step, computeStatus)}
              <StepProgress progressPct={state.progress}/>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}