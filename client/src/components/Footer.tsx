import * as React from 'react';
import styled from "styled-components";
import { NormalBodyText, textColor } from './../styles';

const FooterText = styled.div`
  font-family: Avenir Next, sans-serif;
  font-size: 20px;
  color: #fff;
  font-weight: 400;
`

export default function Footer(props: any) {
  return (
    <div style={{
      paddingLeft: '111px', paddingTop: '87px', paddingBottom: '87px', backgroundColor: '#000' }}>
      <FooterText>Conceived and built by:</FooterText>
      <FooterText>Wanseob Lim, Barry Whitehat, and Chance Hudson</FooterText>
      <FooterText>EF's Applied ZKP team.</FooterText>
    </div>
  );
}
