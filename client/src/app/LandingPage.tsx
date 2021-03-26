import { Fragment } from "react";
import * as React from "react";
import ButtonAppBar from "../components/ButtonAppBar";
import { ParticipantSection } from "./ParticipantSection";

import {
  accentColor,
  secondAccent,
  textColor,
  PageContainer,
  lighterBackground,
  SectionContainer,
  CeremonyTitle,
  inverseText
} from "../styles";
import AddCeremonyPage from "./AddCeremony";
import Modal from "@material-ui/core/Modal";
import { CeremonyPage } from "./CeremonyPage";
import Footer from './../components/Footer';
import AboutPanel from './../components/AboutPanel';
import { useSelectionContext } from '../state/SelectionContext';
import './styles.css';
import { Box } from "@material-ui/core";
import CircuitsPanel from "../components/CircuitsPanel";

export const LandingPage = () => {
    const [selection, dispatch] = useSelectionContext();

    const closeModal = () => {dispatch({type: 'CLOSE_CEREMONY'});}

    return (
      <>
        <ButtonAppBar />
        <PageContainer>
          <Box style={{ height: '608px' }} >
            <ParticipantSection />
          </Box>
          <AboutPanel />
          <div style={{ height: '140px' }} />
          <CircuitsPanel  />
          <Modal
            open={selection.openModal}
            onClose={closeModal}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
          >
            {(selection.edit) ?
              (<AddCeremonyPage />)
              :
              (<CeremonyPage onClose={closeModal} />)
            /* : (selection.newCircuit) ?
              : (<></>)*/
            }
          </Modal>
        </PageContainer>
        <Footer />
      </>
  );
};
