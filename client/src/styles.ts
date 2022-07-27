import styled, { css } from "styled-components";
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
  /* width: 100vw; */
  max-width: 1600px;
  margin: auto;
  display: flex;
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

export const AuthButton = styled.button`
  background-color: ${accentColor};
  font-family: Inconsolata;
  font-weight: bold;
  font-size: 24px;
  color: #000;
  border-radius: 4px;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 30px;
  padding-right: 30px;
  /* min-width: 160px; */
  border: 0px solid #000;
  &:hover {
    cursor: pointer;
  }
`

export const AuthButtonText = styled.div`
  font-family: Inconsolata;
  font-weight: bold;
  font-size: 24px;
  color: #000;
`

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
  justify-content: space-evenly;

  color: ${inverseText};

  &:hover {
    border-color: ${secondAccent};
    cursor: pointer;
  }
`

export const WelcomeTitle = styled.div`
  font-family: Luckiest Guy;
  font-size: 64px;
  font-weight: normal;
  color: rgba(0,0,0,0);
  letter-spacing: 0.12em;
  cursor: pointer;
  user-select: none;
  -webkit-text-stroke-width: 2px;
  -webkit-text-stroke-color: ${textColor};
`;

const textBase = css`
  font-family: Inconsolata;
  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 140%;

  color: ${textColor};
`;

export const SubtleBody = styled.div`
  ${textBase}
  font-weight: bold;
  font-size: 24px;

  color: ${subtleText};
`;

export const SubtleBodyCentred = styled.div`
  ${textBase}
  font-weight: bold;
  font-size: 24px;

  display: flex;
  align-items: center;
  justify-content: space-evenly;
  text-align: center;
  color: ${subtleText};
`

export const NormalBodyText = styled.div`
  ${textBase}
`;

export const HighlightBodyText = styled.div`
  ${textBase}
  color: ${accentColor};
`

export const PanelTitle = styled.div`
  font-family: Inconsolata;
  font-style: normal;
  font-weight: bold;
  font-size: 48px;
  line-height: 140%;
  /* or 67px */

  display: flex;
  align-items: center;

  /* Text/Normal */

  color: ${textColor};
`

export const H3Title = styled.div`
  font-family: Inconsolata;
  font-style: normal;
  font-weight: bold;
  font-size: 24px;
  line-height: 140%;
  /* or 34px */
  color: ${textColor};
  margin-bottom: 32px;
`


// ##########################
// Fonts
//

WebFont.load({
  google: {
    families: ['Shrikhand', 'Inconsolata', 'Avenir Next', 'Luckiest Guy' ]
  }
});
