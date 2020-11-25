import * as React from "react";

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

export function useAuthContextValue(): AuthContextInterface {
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
