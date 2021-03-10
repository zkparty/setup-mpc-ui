import color from "color";
import styled from "styled-components";

export const background = "#081b24";
export const lighterBackground = "#0E2936";
export const textColor = "#FFFFFF";
export const accentColor = "#00ffd1";
export const secondAccent = "#D0fff7";

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
