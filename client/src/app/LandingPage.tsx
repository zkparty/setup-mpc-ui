import { useState, useEffect, Fragment } from "react";
import * as React from "react";
import styled, { css } from "styled-components";
import Typography from "@material-ui/core/Typography";
import ButtonAppBar from "../components/ButtonAppBar";
import { ParticipantSection } from "./ParticipantSection";

import {
  accentColor,
  secondAccent,
  textColor,
  PageContainer,
  lighterBackground,
  SectionContainer,
  CeremonyTitle
} from "../styles";
import { AuthStateContext } from "../state/AuthContext";
import AddCeremonyPage from "./AddCeremony";
import Modal from "@material-ui/core/Modal";
import { CeremonyPage } from "./CeremonyPage";
import CircuitsTable from '../components/CircuitsTable';
import Footer from './../components/Footer';
import AboutPanel from './../components/AboutPanel';
import { useSelectionContext } from '../state/SelectionContext';
import './styles.css';
import { withStyles } from "@material-ui/core/styles";

export const LandingPage = () => {
    const [selection, dispatch] = useSelectionContext();

    const changeTab = (event: React.ChangeEvent<{}> | null, newValue: string) => {
      if (newValue === '3') {
        dispatch({type: 'ADD_CEREMONY'});
      }
    };

    const closeModal = () => {dispatch({type: 'CLOSE_CEREMONY'});}

    return (
        <AuthStateContext.Consumer>
          {Auth => {
            console.debug(`landing page: ${Auth.isCoordinator}`);
            return (
              <Fragment>
                <ButtonAppBar />
                <PageContainer>
                  <div>
                    <ParticipantSection />
                    <AboutPanel />
                    <CircuitsTable />
                    <Footer />
                    <Modal
                      open={selection.openModal}
                      onClose={closeModal}
                      aria-labelledby="simple-modal-title"
                      aria-describedby="simple-modal-description"
                    >
                      {(selection.circuitDetail) ?
                        (<CeremonyPage onClose={closeModal} />)
                        : (selection.newCircuit) ? 
                        (<AddCeremonyPage />)
                        : (<></>)
                      }
                    </Modal>
                  </div>
                </PageContainer>
              </Fragment>
          )}}
        </AuthStateContext.Consumer>
  );
};
