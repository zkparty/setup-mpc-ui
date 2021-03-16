import { Box, Grid, LinearProgress, LinearProgressProps, Typography } from '@material-ui/core';
import * as React from 'react';
import { useContext } from 'react';
import {
  accentColor,
  secondAccent,
  textColor,
  PageContainer,
  lighterBackground,
  NormalBodyText,
  SubtleBody,
  subtleText,
  gray1,
  darkerBackground,
} from "../styles";
import { ComputeDispatchContext, ComputeStateContext, ComputeStatus, Step } from '../state/ComputeStateManager';
import { Player } from '@lottiefiles/react-lottie-player';
import styled from 'styled-components';
import VisibilitySensor from 'react-visibility-sensor';

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

interface ProgressBarProps extends LinearProgressProps {
  size: string,
}

const StyledProgressBar = styled(LinearProgress).attrs((props: ProgressBarProps) => ({
  size: props.size || 'normal',
}))`
  padding-top: ${ ({ size }) => {return (size === 'small') ? '0px' : '5px';} }; 
  border-radius: 20px; 
  background-color: ${darkerBackground};
  border: 2px solid ${darkerBackground};
  width: ${ ({ size }) => { 
    if (size === 'normal') return '491px'; 
    else return 'default' } }; 

  & > .MuiLinearProgress-barColorPrimary {
    border-radius: 20px;
    background-color: ${accentColor};
    border-color: ${accentColor};
  }

  &.MuiLinearProgress-root.MuiLinearProgress-colorPrimary {
    background-color: ${darkerBackground};
  }
`;

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

export const CeremonyProgress = () => {
  const state = useContext(ComputeStateContext);
  const { circuits, contributionCount } = state;
  const cctCount = circuits.length;
  const ceremonyPct = (cctCount>0) ? 100 * contributionCount / cctCount : 0;

  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <StyledProgressBar 
          variant="determinate" 
          value={ceremonyPct} 
          size='normal'
       />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" style={{ color: subtleText }}>{`${Math.round(
            ceremonyPct
          )}%`}</Typography>
      </Box>
    </Box>
  );
}

const StepProgress = ({ progressPct }: ProgressProps) => {
  return (
    <StyledProgressBar variant="determinate" value={progressPct} size='small' />
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
  const dispatch = useContext(ComputeDispatchContext);

  const { circuits, contributionCount, step, computeStatus } = state;
  const cctCount = circuits.length;

  return (
    <div>
      <VisibilitySensor onChange={isVisible => {if (dispatch) dispatch({type:'VISIBILITY', data: isVisible})}}>
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
              <CeremonyProgress />
            </Grid>
            <Grid item container spacing={6} direction='row'>
              <Grid item container direction='column' style={{ width: '150px' }} >
                <Grid item style={{ height: '34px' }} >
                  <SubtleBody>Circuit</SubtleBody>
                </Grid>
                <Grid item>
                  <NormalBodyText>
                    {contributionCount}/{cctCount}
                  </NormalBodyText>
                </Grid>
              </Grid>
              <Grid item container direction='column' style={{ width: '150px' }} >
                <Grid item style={{ height: '34px' }} >
                  <SubtleBody>Status</SubtleBody>
                </Grid>
                <Grid item>
                  {stepText(step, computeStatus)}
                  <StepProgress progressPct={state.progress}/>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </VisibilitySensor>
    </div>
  );
}

