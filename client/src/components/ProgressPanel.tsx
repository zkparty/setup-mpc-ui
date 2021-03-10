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
import { ComputeDispatchContext, ComputeStateContext } from '../state/ComputeStateManager';

const StyledButton = styled(Button)`
  color: accentColor;
  background: lighterBackground;
  border-width: thin;
  border-color: accentColor;

  &:hover {
    border-color: secondAccent;
  }
`

export default function ProgressPanel(props: any) {
  const state = useContext(ComputeStateContext);
  //const dispatch = useContext(ComputeDispatchContext);

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
              {done}/{total}
            </Grid>
            <Grid item>
              {stepStatus}
              <StepProgress />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}