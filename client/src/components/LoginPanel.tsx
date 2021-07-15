import { Typography } from '@material-ui/core';
import * as React from 'react';
import {
  WelcomeTitle,
  SubtleBody,
  NormalBodyText,
} from "../styles";
import Login from './Login';
import env from '../env';

export default function LoginPanel(props: any) {

  return (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '20px'
    }} >
    <WelcomeTitle>{env.projectName}</WelcomeTitle>
    <div style={{ height: '41px' }} />
    <SubtleBody style={{ textAlign: 'center' }}>
      {`Trusted Setup Ceremony`}
    </SubtleBody>
    <NormalBodyText style={{ marginTop: '8px' }}>
      {`Participate using your GitHub account.`}
    </NormalBodyText>
    <Login />
  </div>);
}
