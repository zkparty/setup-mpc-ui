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
  gray1,
  subtleText,
} from "../styles";
import styled, { css } from "styled-components";
import { ComputeDispatchContext } from '../state/ComputeStateManager';

const StyledButton = styled(Button)`
  color: accentColor;
  background: lighterBackground;
  border-width: thin;
  border-color: accentColor;
  width: 100px;
  height: 34px;
  left: 24px;
  top: 7px;

  font-family: Inconsolata;
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 140%;
  /* identical to box height, or 34px */
  
  display: flex;
  align-items: center;
  
  /* Gray 1 */
  
  color: ${gray1};

  &:hover {
    border-color: secondAccent;
  }
`

const WelcomeTitle = styled.div`
  font-family: Shrikhand;
  font-size: 64px;
  font-weight: normal;
  text-align: center;
  align-items: center;
  letter-spacing: 0.12em;
  cursor: pointer;
  user-select: none;
  flex: 1;
  height: 110px;
  -webkit-text-stroke: 2px solid ${textColor}
`;

const Body = styled.div`
  font-family: Inconsolata;
  font-style: normal;
  font-weight: bold;
  font-size: 24px;
  line-height: 140%;
  /* or 34px */

  display: flex;
  align-items: center;
  text-align: center;
  color: ${subtleText}
`

const Acknowledge = ({ contribute }: { contribute: () => void}) => 
  (<div style={{ display: 'grid', paddingTop: '20px' }}>
    <StyledButton variant='outlined' onClick={contribute} >
      Launch Ceremony
    </StyledButton>
   </div>);

export default function WelcomePanel(props: any) {
  const dispatch = useContext(ComputeDispatchContext);
  const handleClick = () => {
    if (dispatch) dispatch({type: 'ACKNOWLEDGE' });
  }

  return (
  <div style={{ display: 'flex', flexFlow: 'column', alignItems: 'center' }}>
    <WelcomeTitle>Welcome.</WelcomeTitle>
    <Body>
      {`Thank you for joining us for our trusted setup ceremony!`} 
    </Body>
    <Body>
      {`Ready to make your contribution?`} 
    </Body>
    <Acknowledge contribute={handleClick} />
  </div>);
}