import { Switch, Route, HashRouter } from "react-router-dom";
import * as React from "react";
import { createGlobalStyle } from "styled-components";
import firebase from "firebase";
import { textColor } from "../styles";
import { LandingPage } from "./LandingPage";
import { CeremonyPage } from "./CeremonyPage";
import { RegisterPage } from "./RegisterPage";
import Login from "./Login";
import Join from "./Join";
import firebaseConfig from "./firebaseConfig";

firebase.initializeApp(firebaseConfig);

console.log(`firebase API key: ${firebaseConfig.apiKey}`);

export interface AuthContextInterface {
  isLoggedIn: boolean,
  setLoggedIn: (b: boolean) => void,
  authUser: any,
  setAuthUser: (u: any | null) => void
};
const defaultAuth: AuthContextInterface = {
  isLoggedIn: false,
  setLoggedIn: () => false,
  authUser: {},
  setAuthUser: () => null
};
export const AuthContext = React.createContext<AuthContextInterface>(defaultAuth);

function useAuthContextValue(): AuthContextInterface {
  const [isLoggedIn, setLoggedIn] = React.useState( false );
  const [authUser, setAuthUser] = React.useState( {} );

  return {
    isLoggedIn,
    setLoggedIn,
    authUser,
    setAuthUser
  }
}

const App = () => {

  return (
    <AuthContext.Provider value={ useAuthContextValue() }>
      <HashRouter>
        <GlobalStyle />
        <Switch>
          <Route exact path="/register">
            <RegisterPage />
          </Route>
          <Route exact path="/ceremony/:id">
            <CeremonyPage />
          </Route>
          <Route exact path="/">
            <LandingPage />
          </Route>
          <Route exact path="/login">
            <Join />
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
