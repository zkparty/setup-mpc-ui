import * as React from 'react';
import { useReducer } from "react";
import { createGlobalStyle } from "styled-components";
import { textColor } from "../styles";
import { LandingPage } from "./LandingPage";
import { AuthContextProvider, authStateReducer, defaultAuth } from "./AuthContext";
import { SelectionContextProvider } from './SelectionContext';
import firebase from "firebase/app";
import firebaseConfig from "./firebaseConfig";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import { SnackbarProvider } from "notistack";

firebase.initializeApp(firebaseConfig);

const App = () => {

  console.log(`Firebase inited ${firebase.app.name}`);
  console.log(`auth user: ${firebase.auth().currentUser?.displayName}`);
  return (
    <AuthContextProvider>
      <SelectionContextProvider>
        <SnackbarProvider maxSnack={4}>
            <GlobalStyle />
            <LandingPage />
        </SnackbarProvider>
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
