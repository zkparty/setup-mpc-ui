import { Switch, Route, HashRouter } from "react-router-dom";
import * as React from "react";
import { createGlobalStyle } from "styled-components";
import { textColor } from "../styles";
import { LandingPage } from "./LandingPage";
import { CeremonyPage } from "./CeremonyPage";
import { AuthContext, useAuthContextValue } from "./AuthContext";
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
      <SnackbarProvider maxSnack={4}>
        <HashRouter>
          <GlobalStyle />
          <Switch>
            <Route exact path="/ceremony/:id">
              <CeremonyPage />
            </Route>
            <Route exact path="/">
              <LandingPage />
            </Route>
          </Switch>
        </HashRouter>
      </SnackbarProvider>
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
