import { Typography } from '@material-ui/core';
import * as React from 'react';
import {
  WelcomeTitle,
  SubtleBody,
  NormalBodyText,
} from "../styles";
import Login from './Login';

const project = 'zkopru';

export default function LoginPanel(props: any) {

  return (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '20px'
    }} >
    <WelcomeTitle>{project}</WelcomeTitle>
    <div style={{ height: '41px' }} />
    <SubtleBody>
      {`Trusted Setup Ceremony March, 2021`}
    </SubtleBody>
    <NormalBodyText style={{ marginTop: '8px' }}>
      {`Participate using your GitHub account.`}
    </NormalBodyText>
    <Login />
  </div>);
}
