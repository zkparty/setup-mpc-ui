import { Switch, Route, HashRouter } from "react-router-dom";
import * as React from "react";
import { createGlobalStyle } from "styled-components";
import { textColor } from "../styles";
import { LandingPage } from "./LandingPage";
import { CeremonyPage } from "./CeremonyPage";
import { AddCeremonyPage } from "./AddCeremony";
import firebase from "firebase/app";
import firebaseConfig from "./firebaseConfig";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

firebase.initializeApp(firebaseConfig);

export interface AuthContextInterface {
  isLoggedIn: boolean,
  setLoggedIn: (b: boolean) => void,
  authUser: any,
  setAuthUser: (u: any | null) => void,
  isCoordinator: boolean,
  setCoordinator: (b: boolean) => void,
};
const defaultAuth: AuthContextInterface = {
  isLoggedIn: false,
  setLoggedIn: () => null,
  authUser: {},
  setAuthUser: () => null,
  isCoordinator: false,
  setCoordinator: () => {},
};
export const AuthContext = React.createContext<AuthContextInterface>(defaultAuth);

function useAuthContextValue(): AuthContextInterface {
  const [isLoggedIn, setLoggedIn] = React.useState( false );
  const [authUser, setAuthUser] = React.useState( null );
  const [isCoordinator, setCoordinator] = React.useState( false );

  return {
    isLoggedIn,
    setLoggedIn,
    authUser,
    setAuthUser,
    isCoordinator,
    setCoordinator: (val) => {console.log(`setting coord to ${val}`); setCoordinator(val)},
  }
}

const App = () => {
  console.log(`Firebase inited ${firebase.app.name}`);
  console.log(`auth user: ${firebase.auth().currentUser?.displayName}`);
  return (
    <AuthContext.Provider value={ useAuthContextValue() }>
      <HashRouter>
        <GlobalStyle />
        <Switch>
          <Route exact path="/ceremony/add">
            <AddCeremonyPage />
          </Route>
          <Route exact path="/ceremony/:id">
            <CeremonyPage />
          </Route>
          <Route exact path="/">
            <LandingPage />
          </Route>
        </Switch>
      </HashRouter>
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
