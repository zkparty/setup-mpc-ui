import Button from "@material-ui/core/Button";
import * as React from 'react';
import { useContext } from 'react';
import {
  textColor,
  inverseText,
  accentColor,
  background,
  secondAccent,
  lighterBackground,
} from "../styles";
import styled from "styled-components";
import { ComputeStateContext } from '../state/ComputeStateManager';
import TwitterIcon from '@material-ui/icons/Twitter';

const StyledAccentButton = styled.a`
  color: ${inverseText};
  background-color: ${accentColor};
  font-style: normal;
  font-weight: bold;
  font-size: 24px;
  border-radius: 4px;
  width: 350px;
  height: 53px;
  display: flex;
  align-items: center;
  margin-right: 32px;
`

const StyledButton = styled.a`
  color: ${textColor};
  background: ${lighterBackground};
  font-style: normal;
  font-weight: bold;
  font-size: 24px;
  border-radius: 4px;
  width: 216px;
  height: 53px;
  align-items: center;
`

const tweetText = (siteSettings: any, url: string): string => {
  //const siteSettings = await getSiteSettings();
  const EOL = '\n';
  const body = encodeURIComponent(siteSettings.tweetTemplate.replace('{URL}', url).replaceAll('{EOL}', EOL));

  return `https://twitter.com/intent/tweet?text=${body}`;
}


export default function AttestationPanel(props: any) {
  const state = useContext(ComputeStateContext);

  const { siteSettings, summaryGistUrl } = state;
  let text=(<></>);
  if (summaryGistUrl && siteSettings) {
    text = (
      <div style={{ display: 'flex' }}>
        <StyledAccentButton
           href={tweetText(siteSettings, summaryGistUrl)} target='_blank' >
              <TwitterIcon fontSize='large' />
              Share your attestation
        </StyledAccentButton>
        <StyledButton href={summaryGistUrl} target='_blank' >
          View your summary
        </StyledButton>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }} >
    {text}
    </div>
  );
}