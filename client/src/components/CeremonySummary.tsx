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

const Bold = styled.div`
  font-weight: bold;
`;

const Flex = styled.div`
  display: flex;
`;

const CeremonySummary = (props: { ceremony: Ceremony, onClick: () => void } & RouteProps) => {
    const c = props.ceremony;
    const { setSelectedCeremony } = useContext(SelectedCeremonyContext);
  
    //let history = useHistory();
  
    const onClick = () => {
      setSelectedCeremony(c.id);
      props.onClick();
    };

    //console.log(`ceremony id: ${c.id}`);
    const progress = c.complete ? Math.min(100, 100 * c.complete/c.minParticipants) : '';
  
    return (
      <CeremonyContainer onClick={onClick}>
        <CeremonyTitle>{c.title}</CeremonyTitle>
        {c.description}
        <br />
        <br />
        <Flex>
          <Bold>Status:&nbsp;</Bold>{` ${c.ceremonyState}` +
            (c.ceremonyState === "RUNNING" ? ` (${progress}%)` : "")}
        </Flex>
        <br />
        <Flex>
          <Bold>Contribution Progress:&nbsp;</Bold>
          {` ${(c.complete===undefined) ? '-' : c.complete } completed. 
            ${(c.waiting===undefined) ? '-' : c.waiting} waiting.
            Target: ${c.minParticipants} `}
        </Flex>
      </CeremonyContainer>
    );
  };
  
  export default CeremonySummary;
