import { RouteProps, useHistory } from "react-router-dom";
import * as React from "react";
import styled from "styled-components";
import {
  accentColor,
  secondAccent,
  textColor,
  PageContainer,
  lighterBackground,
  SectionContainer,
  CeremonyTitle
} from "../styles";
import { Ceremony } from "../types/ceremony";
import { format } from "timeago.js";
import { SelectedCeremonyContext } from "../app/LandingPage";
import { useContext } from "react";

const CeremonyContainer = styled.div`
  background-color: ${lighterBackground};
  margin: 10px;
  width: 512px;
  padding: 16px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;

  &:hover {
    border: 2px solid ${secondAccent};
  }
`;

const CeremonySummary = (props: { ceremony: Ceremony, onClick: () => void } & RouteProps) => {
    const c = props.ceremony;
    const { setSelectedCeremony } = useContext(SelectedCeremonyContext);
  
    //let history = useHistory();
  
    const onClick = () => {
      setSelectedCeremony(c.id);
      props.onClick();
    };

    console.log(`ceremony id: ${c.id}`);
  
    return (
      <CeremonyContainer onClick={onClick}>
        <CeremonyTitle>{c.title}</CeremonyTitle>
        {`STATUS: ${c.ceremonyState}` +
          (c.ceremonyState === "RUNNING" ? ` (${c.ceremonyProgress}%)` : "")}
        <br />
        <br />
        {c.description}
        <br />
        <br />
        {`Last updated: ${format(c.lastSummaryUpdate)}`}
      </CeremonyContainer>
    );
  };
  
  export default CeremonySummary;
