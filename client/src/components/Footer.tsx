import * as React from 'react';
import styled from "styled-components";
import { NormalBodyText, textColor } from './../styles';

const StyledBody = styled.div`
  ${NormalBodyText}
  font-size: 24px;
  line-height: 140%;
`;

export default function Footer(props: any) {
    const body = (
      <div style={{ marginLeft: '111px' }}>
        <StyledBody>Conceived and built by:</StyledBody>
        <StyledBody>Wanseob Lim, Barry Whitehat, and Chance Hudson</StyledBody>
        <StyledBody>EF's Applied ZKP team.</StyledBody>
      </div>
    );

    return body;
}