import { Typography } from '@material-ui/core';
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
import { ComputeDispatchContext } from '../state/ComputeStateManager';
import Login from './Login';

const StyledButton = styled(Button)`
  color: accentColor;
  background: lighterBackground;
  border-width: thin;
  border-color: accentColor;

  &:hover {
    border-color: secondAccent;
  }
`

const project = 'zkopru';

export default function LoginPanel(props: any) {

  return (
  <div>
    <Typography variant='h2'>{project}</Typography>
    <Typography variant="body1" align="center">
      {`Trusted Setup Ceremony March, 2021`} 
    </Typography>
    <Typography variant="body1" align="center">
      {`Participate using your GitHub account.`} 
    </Typography>
    <Login />
  </div>);
}