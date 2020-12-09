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
import { ceremonyListener, getCeremonies, getCeremonyCounts } from "../api/FirestoreApi";
import { AuthContext } from "./AuthContext";
import AddCeremonyPage from "./AddCeremony";
import Modal from "@material-ui/core/Modal";
import { CeremonyPage } from "./CeremonyPage";
import './styles.css';
import { withStyles } from "@material-ui/core/styles";

export interface SelectedCeremonyContextInterface {
  selectedCeremony: string,
  setSelectedCeremony: (id: string) => void,
};

const defaultSelection: SelectedCeremonyContextInterface = {
  selectedCeremony: "",
  setSelectedCeremony: () => null,
};
export const SelectedCeremonyContext = React.createContext<SelectedCeremonyContextInterface>(defaultSelection);

const StyledTabs = withStyles(theme => ({
  indicator: {
    backgroundColor: secondAccent
  },

}))(Tabs);

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
                <StyledTabs 
                  value={activeTab} 
                  onChange={handleChange}
                  centered
                  style = {{ color: accentColor }}
                >
                  <Tab label="Ceremonies" value="1" />
                  <Tab label="Participate" value="2" />
                  {Auth.isCoordinator ? (<Tab label="New Ceremony" value="3" />) : (<></>) }
                </StyledTabs>
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
                  <CeremonyPage id={selectedCeremony} onClose={closeCeremonyModal} />
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

  const findCeremonyIndex = (id: string): number => {
    return ceremonies.findIndex(val => val.id === id);
  }

  const updateCeremony = (ceremony: Ceremony) => {
    //console.log(`${ceremony}`);
    const i = findCeremonyIndex(ceremony.id);
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

  const updateCeremonyCounts = (c: any) => {
    // callback for ceremony counts query
    // returns {ceremonyId, complete, waiting}
    console.log(`update count ${c.ceremonyId} ${c.complete}`);
    const i = findCeremonyIndex(c.ceremonyId);
    if (i>=0) {
      ceremonies[i].waiting = c.waiting;
      ceremonies[i].complete = c.complete;
    }
    setCeremonies(ceremonies);
  }

  useEffect(() => {
    getCeremonies()
      .then(ceremonies => {
        setCeremonies(ceremonies);
        setLoaded(true);
        getCeremonyCounts(updateCeremonyCounts);
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