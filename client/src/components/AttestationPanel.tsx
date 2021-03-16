import Button from "@material-ui/core/Button";
import * as React from 'react';
import { useContext } from 'react';
import {
  textColor,
  inverseText,
  accentColor,
  background,
  secondAccent,
} from "../styles";
import styled from "styled-components";
import { ComputeStateContext } from '../state/ComputeStateManager';
import TwitterIcon from '@material-ui/icons/Twitter';

const StyledAccentButton = styled(Button)`
  color: ${inverseText};
  background: ${accentColor};
  border-radius: 4px;
  width: 350px;
  height: 53px;
  display: flex;
  align-items: center;

  & > a {
    color: ${inverseText};
  }
`

const StyledButton = styled(Button)`
  color: ${textColor};
  background: ${background};
  border-radius: 4px;
  width: 216px;
  height: 53px;

  & > a {
    color: ${inverseText};
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

  const { siteSettings, summaryGistUrl } = state;
  let text=(<></>);
  if (summaryGistUrl && siteSettings) {
    text = (
      <div>
        <StyledAccentButton>
          <a href={tweetText(siteSettings, summaryGistUrl)} target='_blank' style={{ color:  '#1DA1F2' }}>
              <TwitterIcon fontSize='large' />
              Share your attestation
          </a>
        </StyledAccentButton>
        <StyledButton >
          <a href={summaryGistUrl} target='_blank' >
          View you contribution summary
          </a>
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