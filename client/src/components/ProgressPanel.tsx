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
  darkerBackground,
} from "../styles";
import { ComputeDispatchContext, ComputeStateContext, ComputeStatus, Step } from '../state/ComputeStateManager';
import { Player } from '@lottiefiles/react-lottie-player';
import styled from 'styled-components';
import VisibilitySensor from 'react-visibility-sensor';
import AttestationPanel from './AttestationPanel';
import { ContributionState } from '../types/ceremony';
import state from '../state/state';
import { observer } from 'mobx-react-lite';
import Queue from '../state/Ceremony';

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
  barColor: string,
}

const StyledProgressBar = styled(LinearProgress).attrs((props: ProgressBarProps) => ({
  size: props.size || 'normal',
  barColor: props.barColor || accentColor,
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
    background-color: ${({barColor}) => barColor};
    border-color: ${({barColor}) => barColor};
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

const queueText = (queue: number) => {
  if (queue > 1) {
    return `No. ${queue} in line`;
  } else if (queue == 1) {
    return 'Next in line';
  } else {
    return 'Your turn';
  } 
}

const queueStatus = (contribState: ContributionState) => {
  let queue = 0;
  let dots = '';
  try {
    queue = contribState.queueIndex - contribState.currentIndex; 
    dots = ' .'.repeat(Math.max(queue, 0));
  } catch (err) {
    if (err instanceof Error)
    console.warn(`Wait queue error: ${err.message}`);
  }
  return (
    <div>
      <NormalBodyText>{queueText(queue)}</NormalBodyText>
      <div style={{ color: accentColor, textAlign: 'right' }}>{dots}</div>
    </div>
  );
};

interface ProgressProps {
  progressPct: number,
}

export const CeremonyProgress = (props: any) => {
  const state = useContext(ComputeStateContext);
  const { circuits, contributionCount, step, computeStatus, contributionState } = state;
  const cctCount = circuits.length;
  const ceremony = contributionState ? contributionState.ceremony : undefined;
  const cctNum = ceremony ? ceremony.sequence || contributionCount : contributionCount;
  const ceremonyPct = (cctCount>0) ? 100 * contributionCount / cctCount : 0;
  const { format } = props;

  const prefix = (format && format === 'bar') ?
    (<NormalBodyText style={{ paddingRight: '20px' }} >
      {`C${cctNum} ${stepText(step, computeStatus)}`}
    </NormalBodyText>)
    :
    (<></>);

  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1} style={{ display:'flex', flexDirection:'row', alignItems:'center' }} >
        {prefix}
        <StyledProgressBar 
          variant="determinate" 
          value={ceremonyPct} 
          size='normal'
          barColor={(step === Step.QUEUED) ? subtleText : accentColor}
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

const status = (ceremony: Queue, dispatch: React.Dispatch<any>) => {
  const { circuits, contributionCount, contributionState, step, computeStatus, progress } = ceremony;
  //const ceremony = contributionState ? contributionState.ceremony : undefined;
  const cctNum = ceremony ? ceremony.sequence || 0 : 0;
  const cctCount = circuits.length;
  let header = '';
  let body1 = (<></>);
  let body2 = (<></>);
  if (step === Step.COMPLETE) {
    header = 'Contribution Complete.';
    body1 = (
      <div>
        <NormalBodyText>
        You've successfully contributed to {cctCount} circuits.
        </NormalBodyText>
        <br />
        <NormalBodyText>
        Thank you for participating!
        </NormalBodyText>
      </div>);
    body2 = (<AttestationPanel style={{ marginTop: '80px' }}/>);
  } else {
    let statusCell = (<></>);
    if (step === Step.QUEUED) {
      // Circuit breaker to avoid 'you are -1 in line'
      if (!contributionState.queueIndex ||
         !contributionState.currentIndex ||
         contributionState.currentIndex > contributionState.queueIndex) {
           // Trigger a restart of the circuit
           dispatch({type: 'SET_STEP', data: Step.INITIALISED});
      }

      header = 'You are in line.';
      statusCell = queueStatus(contributionState);
    } else {
      header = 'Contribution Active.';
      statusCell = (
        <div>
          {stepText(step, computeStatus)}
          <StepProgress progressPct={progress}/>
        </div>
      );
    }
    body1 = (
      <div style={{ lineHeight: '0px', width: 'max-content' }}>
        <NormalBodyText>
        ATTENTION:
        </NormalBodyText>
        <br />
        <NormalBodyText>
        Closing this browser window will interrupt your contribution.
        </NormalBodyText>
      </div>);
    body2 = (
      <div style={{ marginTop: '80px' }}>
        <Grid item>
          <CeremonyProgress />
        </Grid>
        <Grid item container spacing={6} direction='row' style={{ marginTop:'58px' }} >
          <Grid item container direction='column' style={{ width: '150px' }} >
            <Grid item style={{ height: '34px' }} >
              <SubtleBody style={{ justifyContent: 'left' }}>Circuit</SubtleBody>
            </Grid>
            <Grid item>
              <NormalBodyText>
                {cctNum}/{cctCount}
              </NormalBodyText>
            </Grid>
          </Grid>
          <Grid item container direction='column' style={{ width: '150px' }} >
            <Grid item style={{ height: '34px' }} >
              <SubtleBody style={{ justifyContent: 'left' }}>Status</SubtleBody>
            </Grid>
            <Grid item>
              {statusCell}
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
  return { header, body1, body2 };
}

const ProgressPanel = observer(() => {
  const { ceremony } = useContext(state);
  const dispatch = useContext(ComputeDispatchContext);

  if (!dispatch) return (<></>);

  const content = status(ceremony, dispatch);

  return (
    <div>
        <Grid container spacing={4} direction='row' style={{ display: 'flex', paddingTop: '86px' }} >
          <Grid item style={{ width: '45%' }} >
            <Animation />
          </Grid>
          <Grid item container direction='column' style={{ width: '55%', paddingTop: '41px', display: 'flex', justifyContent: 'space-evenly' }} >
            <Grid item>
              <StyledHeader style={{  }}>
                {content.header}
              </StyledHeader>
            </Grid>
            <Grid item>
              <VisibilitySensor onChange={isVisible => {dispatch({type:'VISIBILITY', data: isVisible})}}>
                {content.body1}
              </VisibilitySensor>
            </Grid>
            <Grid item>
              {content.body2}
            </Grid>
          </Grid>
        </Grid>
    </div>
  );
});

export default ProgressPanel;

