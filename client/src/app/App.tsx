import * as React from 'react';
import { useReducer } from "react";
import { createGlobalStyle } from "styled-components";
import { textColor } from "../styles";
import { LandingPage } from "./LandingPage";
import { AuthContextProvider, authStateReducer, defaultAuth } from "../state/AuthContext";
import { SelectionContextProvider } from '../state/SelectionContext';
import firebase from "firebase/app";
import firebaseConfig from "./firebaseConfig";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import { SnackbarProvider } from "notistack";
import { ComputeContextProvider } from '../state/ComputeStateManager';

firebase.initializeApp(firebaseConfig);
firebase.firestore().settings({ experimentalForceLongPolling: true });


const App = () => {

  console.log(`Firebase inited ${firebase.app.name}`);
  console.log(`auth user: ${firebase.auth().currentUser?.displayName}`);
  return (
    <AuthContextProvider>
      <SelectionContextProvider>
        <ComputeContextProvider>
          <SnackbarProvider maxSnack={4}>
              <GlobalStyle />
              <LandingPage />
          </SnackbarProvider>
        </ComputeContextProvider>
      </SelectionContextProvider>
    </AuthContextProvider>
  );
};

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #081a24;
    color: ${textColor};
    margin: 0;
    font-family: 'Inconsolata', monospace;
    font-size: 11pt;
  }
`;

export default App;
