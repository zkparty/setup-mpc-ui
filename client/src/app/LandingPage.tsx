import { Link, RouteProps, useHistory } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import * as React from "react";
import styled, { css } from "styled-components";
import Typography from "@material-ui/core/Typography";
import Tabs from "@material-ui/core/Tabs";
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
import { ceremonyListener, getCeremonies } from "../api/FirebaseApi";
import { AuthContext } from "./AuthContext";
import AddCeremonyPage from "./AddCeremony";
import Modal from "@material-ui/core/Modal";
import { CeremonyPage } from "./CeremonyPage";

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

export interface SelectedCeremonyContextInterface {
  selectedCeremony: string,
  setSelectedCeremony: (id: string) => void,
};
const defaultSelection: SelectedCeremonyContextInterface = {
  selectedCeremony: "",
  setSelectedCeremony: () => null,
};
export const SelectedCeremonyContext = React.createContext<SelectedCeremonyContextInterface>(defaultSelection);

export const LandingPage = () => {
    const [activeTab, setActiveTab] = useState("1");
    const [openModal, setOpenModal] = React.useState(false);
    const [selectedCeremony, setSelectedCeremony] = React.useState("");

    const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
      setActiveTab(newValue);
    };

    const openCeremonyModal = () => {setOpenModal(true)};

    const closeCeremonyModal = () => {setOpenModal(false)};

    return (
      <SelectedCeremonyContext.Provider value={{selectedCeremony, setSelectedCeremony}}>
        <AuthContext.Consumer>
          {(Auth) => {console.log(`landing page: ${Auth.isCoordinator}`); return (
            <Fragment>
              <ButtonAppBar />
              <PageContainer>
                <Tabs 
                  value={activeTab} 
                  onChange={handleChange}
                  centered
                  style = {{ color: accentColor }}
                >
                  <Tab label="Ceremonies" value="1" />
                  <Tab label="Participate" value="2" />
                  {Auth.isCoordinator ? (<Tab label="New Ceremony" value="3" />) : (<></>) }
                </Tabs>
                <TabPanel value={activeTab} index="1">
                  <SummarySection key="summary" onClick={openCeremonyModal}/>
                </TabPanel>
                <TabPanel value={activeTab} index="2">
                  <ParticipantSection key="participants" />
                </TabPanel>
                <TabPanel value={activeTab} index="3">
                  <AddCeremonyPage onSubmit={openCeremonyModal}/>
                </TabPanel>
                <Modal
                  open={openModal}
                  onClose={closeCeremonyModal}
                  aria-labelledby="simple-modal-title"
                  aria-describedby="simple-modal-description"
                >
                  <CeremonyPage id={selectedCeremony}/>
                </Modal>
              </PageContainer>
            </Fragment>
          )}}
        </AuthContext.Consumer>
      </SelectedCeremonyContext.Provider>
  );
};

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

const SummarySection = (props: any) => {
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
  };

  useEffect(() => {
    getCeremonies()
      .then(ceremonies => {
        setCeremonies(ceremonies);
        setLoaded(true);
        // Subscribe to ceremony updates
        refreshCeremonySummaries();
      })
      .catch(() => {
        setLoaded(true);
      });
  }, [loaded]);

  return (
    <>
      {ceremonies.map((c, i) => (
        <CeremonySummary key={i} ceremony={c} onClick={props.onClick} />
      ))}
    </>
  );
};