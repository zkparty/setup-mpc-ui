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
import { ComputeDispatchContext, ComputeStateContext } from '../state/ComputeStateManager';
import TwitterIcon from '@material-ui/icons/Twitter';

const StyledButton = styled(Button)`
  color: accentColor;
  background: lighterBackground;
  border-width: thin;
  border-color: accentColor;

  &:hover {
    border-color: secondAccent;
  }
`

const tweetText = (siteSettings: any, url: string): string => {
  //const siteSettings = await getSiteSettings();
  const EOL = '\n';
  const body = encodeURIComponent(siteSettings.tweetTemplate.replace('{URL}', url).replaceAll('{EOL}', EOL));

  return `https://twitter.com/intent/tweet?text=${body}`;
}


export default function AttestationPanel(props: any) {
  const state = useContext(ComputeStateContext);
  const dispatch = useContext(ComputeDispatchContext);

  const { siteSettings, summaryGistUrl } = state;
  let text=(<></>);
  if (summaryGistUrl && siteSettings) {
    text = (
      <div>
        {text}
        <p></p>
        {`Your contributions have been recorded `}
        <a href={summaryGistUrl} target='_blank' style={{ color: textColor }}>here</a>
        <p></p>
        <div style = {{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Tweet your attestation
          <a href={tweetText(siteSettings, summaryGistUrl)} target='_blank' style={{ color:  '#1DA1F2' }}>
              <TwitterIcon fontSize='large' />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }} >
    {text}
    </div>
  );
}