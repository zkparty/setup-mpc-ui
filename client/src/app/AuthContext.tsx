import * as React from "react";
import { Dispatch, useReducer } from "react";

export interface AuthContextInterface {
  state: {
    isLoggedIn: boolean,
    authUser: any,
    isCoordinator: boolean,
    accessToken: string | null,},
  dispatch: Dispatch<any>,
};

const defaultAuth: AuthContextInterface = {
  state: {
    isLoggedIn: false,
    authUser: {},
    isCoordinator: false,
    accessToken: null,
  },
  dispatch: ()=>{},
};

export const AuthContext = React.createContext<AuthContextInterface>(defaultAuth);

export function useAuthContextValue(): AuthContextInterface {
  //const [isLoggedIn, setLoggedIn] = React.useState( false );
  //const [authUser, setAuthUser] = React.useState( null );
  //const [isCoordinator, setCoordinator] = React.useState( false );
  //const [accessToken, setAccessToken] = React.useState<string | null>( null );
  const [state, dispatch] = useReducer(authStateReducer, defaultAuth);

  return {
    state: {...state},
    dispatch
  }
}

export const authStateReducer = (state: any, action: any):any => {
  let newState = state;
  switch (action.type) {
    case 'LOGIN': {
      newState = {...newState, isLoggedIn: true, authUser:action.user, accessToken: action.accessToken };
      break;
    }
    case 'LOGOUT': {
      newState = {...newState, isLoggedIn: false, authUser: null, isCoordinator: false, accessToken: null};
      break;
    }
    case 'SET_COORDINATOR': {
      newState = {...newState, isCoordinator: true };
      break;
    }
  } 
  return newState;
}