import * as React from "react";
import { Dispatch, PropsWithChildren, useEffect, useReducer, useState } from "react";
import firebase from "firebase";
import { getSiteSettings, getUserStatus } from "../api/FirestoreApi";

export interface AuthContextInterface {
  isLoggedIn: boolean;
  authUser: any;
  isCoordinator: boolean;
  accessToken: string | null;
  loaded: boolean;
  manualAttestation: boolean;
  project?: string;
  defaultProject?: string;
};

export const defaultAuth: AuthContextInterface = {
  isLoggedIn: false,
  authUser: {},
  isCoordinator: false,
  accessToken: null,
  loaded: false,
  manualAttestation: false,
};

export const AuthStateContext = React.createContext<AuthContextInterface>(defaultAuth);
export const AuthDispatchContext = React.createContext<Dispatch<any> | undefined>(undefined);

type AuthProps = PropsWithChildren<{ project?: string }>;

export const AuthContextProvider = (props:AuthProps) => {
  const [state, dispatch] = useReducer(authStateReducer, { ...defaultAuth, project: props.project });

  console.debug(`init auth context`);

  useEffect(() => {
    if (!state.loaded) {
      firebase.auth().onAuthStateChanged(user => {
        console.debug(`auth state changed: ${user?.displayName}`);
        if (user) {
          // Get site-wide settings
          getSiteSettings()
            .then(data => {if (data) dispatch({ type: 'SITE_SETTINGS', data })})
            .catch(err => console.error(`Error getting site settings: ${err.message}`));
        
          //console.debug(`dispatch login ${JSON.stringify(user)}`);
          dispatch({
            type: 'LOGIN',
            user: user,
            //accessToken: (user as any).stsTokenManager?.accessToken,
          });
          if (!user?.displayName) {
            console.warn(`user displayName not available`);
          }
        } else {
          dispatch(
            {type: 'LOGOUT'}
          );
        }
      });
    }

    // Resolve project
    const project = props.project || state.defaultProject;
    if (project && !state.project) {
      dispatch({ type: 'SET_PROJECT_ID', data: project });
    }
    // Get project settings??

    // Get user privileges
    if (state.authUser?.email && state.project) {
      getUserStatus(state.authUser?.email, state.project)
        .then((resp: string) => {
          console.debug(`privs: ${resp}`);
          if ("COORDINATOR" === resp) {
            dispatch({type: 'SET_COORDINATOR'});
          }
        });
    }
    
  }, [state.loaded, state.authUser, state.project, state.defaultProject]);

  return (
    <AuthStateContext.Provider value={ state }>
      <AuthDispatchContext.Provider value={ dispatch }>
        {props.children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  )
};

export const authStateReducer = (state: any, action: any):any => {
  let newState = {...state};
  switch (action.type) {
    case 'LOGIN': {
      console.debug(`LOGIN token ${action.accessToken}`);
      if (action.accessToken !== undefined) newState = {...newState, accessToken: action.accessToken};
      return {...newState, isLoggedIn: true, authUser: {...state.authUser, ...action.user}, loaded: true };
    }
    case 'LOGOUT': {
      firebase.auth().signOut();
      return {...newState, isLoggedIn: false, authUser: null, isCoordinator: false, accessToken: null, loaded: true};
    }
    case 'SET_COORDINATOR': {
      return {...newState, isCoordinator: true };
    }
    case 'MANUAL_ATTESTATION': {
      return {...newState, manualAttestation: action.option};
    }
    case 'SITE_SETTINGS': {
      return {...newState, defaultProject: action.data.defaultProject};
    }
    case 'SET_PROJECT_ID': {
      return {...newState, project: action.data};
    }
  }
  console.log(`unknown action type ${action.type}`);
  return state;
}