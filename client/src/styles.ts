import { Button } from "@material-ui/core";
import color from "color";
import styled from "styled-components";
import WebFont from 'webfontloader';

export const background = "#081b24";
export const lighterBackground = "#5D7078";
export const darkerBackground = "#0E2936";
export const textColor = "#FFFFFF";
export const accentColor = "#00ffd1"; // Primary 1
export const secondAccent = "#D0fff7"; // Primary 2
export const lightBorder = "#5D7078";
export const darkBorder = "#0E2936";
export const gray1 = "#333333";
export const subtleText = "#95a7ae";
export const inverseText = "#000000";

export const PageContainer = styled.div`
  display: flex;
  width: 100vw;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 64px;
  margin-bottom: 64px;
`;

export const SectionContainer = styled.div`
  margin-top: 32px;
`;

export const Center = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export const CeremonyTitle = styled.div`
  font-size: 18pt;
  margin-bottom: 8px;
  color: ${accentColor};
`;

export const StyledButton = styled.button`
  background-color: ${accentColor};
  border-width: thin;
  border-color: ${accentColor};
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
  
  font-color: ${gray1};

  &:hover {
    border-color: secondAccent;
    cursor: pointer;
  }
`

export const WelcomeTitle = styled.div`
  font-family: Shrikhand;
  font-size: 64px;
  font-weight: normal;
  color: black;
  text-align: center;
  align-items: center;
  letter-spacing: 0.12em;
  cursor: pointer;
  user-select: none;
  flex: 1;
  height: 110px;
  -webkit-text-stroke-width: 2px;
  -webkit-text-stroke-color: ${textColor};
`;

export const SubtleBody = styled.div`
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

export const NormalBodyText = styled.div`
  font-family: Inconsolata;
  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 140%;
  /* or 25px */


  /* Text/Normal */

  color: ${textColor};
`;


// ##########################
// Fonts
//

WebFont.load({
  google: {
    families: ['Shrikhand', 'Inconsolata']
  }
});