import * as React from "react";
import { createGlobalStyle } from "styled-components";
import { textColor } from "../styles";
import { LandingPage } from "./LandingPage";
import { AuthContext, useAuthContextValue } from "./AuthContext";
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
    <AuthContext.Provider value={ useAuthContextValue() }>
      <SelectionContextProvider>
        <SnackbarProvider maxSnack={4}>
            <GlobalStyle />
            <LandingPage />
        </SnackbarProvider>
      </SelectionContextProvider>
    </AuthContext.Provider>
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
