import * as React from 'react';
import { createGlobalStyle } from "styled-components";
import { background, textColor } from "../styles";
import { LandingPage } from "./LandingPage";
import { AuthContextProvider } from "../state/AuthContext";
import { SelectionContextProvider } from '../state/SelectionContext';
// import firebase from "firebase/app";
// import firebaseConfig from "./firebaseConfig";
// import "firebase/auth";
// import "firebase/firestore";
// import "firebase/storage";
import { ComputeContextProvider } from '../state/ComputeStateManager';


// firebase.initializeApp(firebaseConfig);
// firebase.firestore().settings({ experimentalForceLongPolling: true });

type AppProps = {
  project?: string | null
};

const App = (props: AppProps) => {
  //console.log(`Firebase inited ${firebase.app.name}`);
  //console.log(`auth user: ${firebase.auth().currentUser?.displayName}`);

  return (
    <AuthContextProvider project={props.project || undefined}>
      <SelectionContextProvider>
        <ComputeContextProvider>
            <GlobalStyle />
            <LandingPage />
        </ComputeContextProvider>
      </SelectionContextProvider>
    </AuthContextProvider>
  );
};

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${background};
    color: ${textColor};
    margin: 0;
    font-family: 'Inconsolata', monospace;
    font-size: 11pt;
  }
`;

export default App;
