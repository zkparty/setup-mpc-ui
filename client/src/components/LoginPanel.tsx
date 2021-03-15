import { Typography } from '@material-ui/core';
import * as React from 'react';
import {
  WelcomeTitle,
  SubtleBody,
} from "../styles";
import Login from './Login';

const project = 'zkopru';

export default function LoginPanel(props: any) {

  return (
  <div style={{ display: 'grid', paddingTop: '20px' }} >
    <WelcomeTitle>{project}</WelcomeTitle>
    <SubtleBody>
      {`Trusted Setup Ceremony March, 2021`} 
    </SubtleBody>
    <Typography variant="body1" align="center">
      {`Participate using your GitHub account.`} 
    </Typography>
    <Login />
  </div>);
}