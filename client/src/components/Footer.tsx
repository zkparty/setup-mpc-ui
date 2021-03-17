import { Typography } from '@material-ui/core';
import * as React from 'react';
import styled from "styled-components";
import { textColor } from './../styles';

const StyledBody = styled.div`
  font-family: 'Avenir Next';
  font-style: normal;
  font-weight: normal;
  /*font-size: 24px; */
  line-height: 140%;
  color: ${textColor}
`;

export default function Footer(props: any) {
    const body = (
      <div>
        <StyledBody>Conceived and built by:</StyledBody>
        <StyledBody>Wanseob Lim, Barry Whitehat, and Chance Hudson</StyledBody>
        <StyledBody>EF's Applied ZKP team.</StyledBody>
      </div>
    );

    return body;
}