import { Link, RouteProps, useHistory } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import * as React from "react";
import styled, { css } from "styled-components";
import { ReactNode } from "react";
import ButtonAppBar from "../components/ButtonAppBar";
import CeremonySummary from "../components/CeremonySummary";
import Typography from "@material-ui/core/Typography";

import {
  accentColor,
  secondAccent,
  textColor,
  PageContainer,
  lighterBackground,
  SectionContainer,
  CeremonyTitle
} from "../styles";
import {
  getCeremonySummaries,
  getCeremonySummariesCached
} from "../api/ZKPartyApi";
import { Ceremony } from "../types/ceremony";
import FileUploader from "../components/FileUploader";

 const TabLink = styled.span<any>`
  ${(props: { selected: boolean }) => {
    return css`
      text-decoration: ${props.selected ? "underline" : "none"};
      cursor: pointer;
      color: ${props.selected ? "black" : accentColor};
      background-color: ${props.selected ? accentColor : "unset"};
      margin-right: 16px;

      &:hover {
        background-color: ${secondAccent};
        color: ${textColor};
      }
    `;
  }}
`;


export const LandingPage = () => {
  return (
    <Fragment>
      <ButtonAppBar />
      <PageContainer>
        <Tabs titles={[ "Ceremonies", "Participate" ]}>
          {[
            <ParticipantsSection key="participants" />,
            <CeremoniesSection key="ceremonies" />
          ]}
        </Tabs>
      </PageContainer>
    </Fragment>
  );
};

const Tabs = (props: { children: ReactNode[]; titles: string[] }) => {
  const [selectedTitleIndex, updateIndex] = useState(0);

  return (
    <>
      <div>
        {props.titles.map((title, i) => (
          <span key={title} onClick={() => updateIndex(i)}>
            { <TabLink selected={i === selectedTitleIndex} >{title}</TabLink> }
          </span>
        ))}
      </div>

      <SectionContainer>{props.children[selectedTitleIndex]}</SectionContainer>
    </>
  );
};

const ParticipantsSection = () => {
  const [ceremonies, setCeremonies] = useState<Ceremony[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refreshCeremonySummaries = () => {
    getCeremonySummaries()
      .then(ceremonies => {
        setCeremonies(ceremonies);
      })
      .catch(err => {
        console.error(`error getting ceremonies: ${err}`);
      });
  };

  useEffect(() => {
    getCeremonySummariesCached()
      .then(ceremonies => {
        setCeremonies(ceremonies);
        setLoaded(true);
        refreshCeremonySummaries();
        // TODO: clear interval with returned function for useEffect
        setInterval(refreshCeremonySummaries, 15000);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, [loaded]);

  return (
    <>
      {ceremonies.map((c, i) => (
        <CeremonySummary key={i} ceremony={c} />
      ))}
    </>
  );
};

const CeremoniesSection = () => {
  return (
    <div style={{ width: "512px" }}>
      <Typography variant="body1">
        Welcome to zkparty. This page will allow you to participate in the ceremony. Once you agree, your computation will commence. 
      </Typography>
      <FileUploader />
    </div>
  );
};

