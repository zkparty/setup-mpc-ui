import { Link, RouteProps, useHistory } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import * as React from "react";
import styled, { css } from "styled-components";
import Typography from "@material-ui/core/Typography";
import MuiTabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import { ReactNode } from "react";
import ButtonAppBar from "../components/ButtonAppBar";
import CeremonySummary from "../components/CeremonySummary";
import { ParticipantSection } from "./ParticipantPage";

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
import { ceremonyListener } from "../api/FirebaseApi";
import { AuthContext } from "./App";

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
    const [activeTab, setActiveTab] = useState("1");

    const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
      setActiveTab(newValue);
    };

    return (
      <AuthContext.Consumer>
        {(Auth) => {console.log(`landing page: ${Auth.isCoordinator}`); return (
          <Fragment>
            <ButtonAppBar />
            <PageContainer>
              <MuiTabs 
                value={activeTab} 
                onChange={handleChange}
                centered
                style = {{ color: accentColor }}
              >
                <Tab label="Ceremonies" value="1" />
                <Tab label="Participate" value="2" />
                {Auth.isCoordinator ? (<Tab label="New Ceremony" value="3" />) : (<></>) }
              </MuiTabs>
              <TabPanel value={activeTab} index="1">
                <SummarySection key="summary" />
              </TabPanel>
              <TabPanel value={activeTab} index="2">
                <ParticipantSection key="participants" />
              </TabPanel>
              <TabPanel value={activeTab} index="3">
                New
              </TabPanel>
            </PageContainer>
          </Fragment>
        )}}
      </AuthContext.Consumer>
  );
};

// const BodySection = (activeTab: number) => {
//   switch (activeTab) {
//     case 1: { 
//       return (<SummarySection key="summary" />);      
//     }
//     case 2: {
//       return (
//         <ParticipantSection key="participants" />
//       );
//     }
//     case 3: {
//       return (
//         <div>New</div>
//       );
//     }
//   };
// };

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}


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

const SummarySection = () => {
  const [ceremonies, setCeremonies] = useState<Ceremony[]>([]);
  const [loaded, setLoaded] = useState(false);

  const updateCeremony = (ceremony: Ceremony) => {
    //console.log(`${ceremony}`);
    const i = ceremonies.findIndex(val => val.id === ceremony.id);
    if (i >= 0) {
      ceremonies[i] = ceremony;
    } else {
      ceremonies.push(ceremony);
    }
    setCeremonies(ceremonies);
  };

  const refreshCeremonySummaries = () => {
    // Firestore listener
    ceremonyListener(updateCeremony);
    /*getCeremonySummaries()
      .then(ceremonies => {
        setCeremonies(ceremonies);
      })
      .catch(err => {
        console.error(`error getting ceremonies: ${err}`);
      }); */
  };

  useEffect(() => {
    getCeremonySummariesCached()
      .then(ceremonies => {
        setCeremonies(ceremonies);
        setLoaded(true);
        refreshCeremonySummaries();
        // TODO: clear interval with returned function for useEffect
        //setInterval(refreshCeremonySummaries, 15000);

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


