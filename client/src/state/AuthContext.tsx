import * as React from "react";
import { Dispatch, PropsWithChildren, useEffect, useReducer, useState } from "react";
import firebase from "firebase";
import { getUserStatus } from "../api/FirestoreApi";

export interface AuthContextInterface {
  isLoggedIn: boolean,
  authUser: any,
  isCoordinator: boolean,
  accessToken: string | null,
  loaded: boolean,
  manualAttestation: boolean,
  project?: string,
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
          // Get user privileges
          if (user.email && props.project) {
            getUserStatus(user.email, props.project)
              .then((resp: string) => {
                console.debug(`privs: ${resp}`);
                if ("COORDINATOR" === resp) {
                  dispatch({type: 'SET_COORDINATOR'});
                }
              });
          } else {
            console.warn(`user email not available`);
          }
          //console.debug(`dispatch login ${JSON.stringify(user)}`);
          dispatch({
            type: 'LOGIN',
            user: user,
            //accessToken: (user as any).stsTokenManager?.accessToken,
          });
      } else {
          dispatch(
            {type: 'LOGOUT'}
          );
        }
      });
    }
  }, [state.loaded]);

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
  }
  console.log(`unknown action type ${action.type}`);
  return state;
}