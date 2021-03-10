import { Grid, Typography } from '@material-ui/core';
import Button from "@material-ui/core/Button";
import * as React from 'react';
import { useContext } from 'react';
import {
  accentColor,
  secondAccent,
  textColor,
  PageContainer,
  lighterBackground,
} from "../styles";
import styled, { css } from "styled-components";
import { ComputeDispatchContext, ComputeStateContext, ComputeStatus, Step } from '../state/ComputeStateManager';

const StyledButton = styled(Button)`
  color: accentColor;
  background: lighterBackground;
  border-width: thin;
  border-color: accentColor;

  &:hover {
    border-color: secondAccent;
  }
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

export default function ProgressPanel(props: any) {
  const state = useContext(ComputeStateContext);
  //const dispatch = useContext(ComputeDispatchContext);

  const { circuits, contributionCount, step, computeStatus } = state;
  const cctCount = circuits.length;

  return (
    <div>
      <Grid container spacing={4}>
        <Grid item xs={6} >
          {lottieAnimation}
        </Grid>
        <Grid item xs={12} container direction='column' >
          <Grid item>
            <Typography variant="h3" align="center">
              Contribution Active
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body1" align="center">
            ATTENTION: Closing this browser window will interrupt your contribution.
            </Typography>
          </Grid>
          <Grid item>
            <CeremonyProgress />
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
              <StepProgress />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}