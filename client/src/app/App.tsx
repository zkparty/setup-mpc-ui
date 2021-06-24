import * as React from 'react';
import { createGlobalStyle } from "styled-components";
import { background, textColor } from "../styles";
import { LandingPage } from "./LandingPage";
import { AuthContextProvider } from "../state/AuthContext";
import { SelectionContextProvider } from '../state/SelectionContext';
import firebase from "firebase/app";
import firebaseConfig from "./firebaseConfig";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import { ComputeContextProvider } from '../state/ComputeStateManager';
import { getSiteSettings } from '../api/FirestoreApi';

firebase.initializeApp(firebaseConfig);
firebase.firestore().settings({ experimentalForceLongPolling: true });

type AppProps = {
  project?: string | null
};

type SiteSettings = {
  defaultProject?: string,
}

const initialSettings: SiteSettings = {
  defaultProject: undefined,
}

const App = (props: AppProps) => {
  const [settings, setSettings] = React.useState<SiteSettings>(initialSettings);

  console.log(`Firebase inited ${firebase.app.name}`);
  console.log(`auth user: ${firebase.auth().currentUser?.displayName}`);

  getSiteSettings().then(data => {if (data) setSettings(data)});

  const project = props.project || settings.defaultProject;

  return (
    <AuthContextProvider project={project}>
      <SelectionContextProvider>
        <ComputeContextProvider settings={settings} project={project}>
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
