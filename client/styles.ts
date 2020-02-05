import * as color from "color";
import styled from "styled-components";

export const background = "#081a24";
export const lighterBackground = color(background)
  .lighten(0.6)
  .toString();
export const textColor = "#aaa";
export const accentColor = "#31c41d";
export const secondAccent = "#731dc4";

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
  margin-bottom: 16px;
  color: ${accentColor};
`;
