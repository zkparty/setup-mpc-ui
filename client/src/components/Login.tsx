import React, { useState, useContext } from "react";
import { AuthDispatchContext, AuthStateContext } from "../state/AuthContext";
import GitHubIcon from "@material-ui/icons/GitHub";
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import firebase from "firebase";
import { accentColor, lighterBackground } from "../styles";
import ListItem from "@material-ui/core/ListItem";
import { ListItemIcon } from "@material-ui/core";
import { getUserStatus } from "../api/FirestoreApi";

const Login = (props: { close: any }) => {
  const [error, setErrors] = useState("");
  const dispatch = useContext(AuthDispatchContext);
  const authState = useContext(AuthStateContext);

  if (!dispatch) return (<></>);
  
  const handleGithubLogin = () => {
    const provider = new firebase.auth.GithubAuthProvider();
    
    provider.addScope('read:user');
    provider.addScope('gist');

    firebase
     .auth()
     .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        firebase
        .auth()
        .signInWithPopup(provider)
        .then((result: any) => {
          console.log(result);
          // Get user privileges
          getUserStatus(result.user.email)
            .then((resp: string) => {
              console.log(`privs: ${resp}`);
              if (resp === 'COORDINATOR') {
                dispatch({type: 'SET_COORDINATOR'})
              }
          });
          console.debug(`dispatch LOGIN`);
          dispatch({
            type: 'LOGIN',
            user: result.user,
            accessToken: result.credential.accessToken,
          });
          props.close();
        })
        .catch((e: { message: React.SetStateAction<string>; }) => setErrors(e.message))
      }) 
  };

  const logOut = () => {
    firebase.auth().signOut();
  };

  return (
    (authState.isLoggedIn) ? 
      (<ListItemIcon  onClick={logOut} style={{ color: accentColor, background: lighterBackground }}>
        <ExitToAppIcon fontSize="small" />
        Log Out
      </ListItemIcon>)
    : 
      (<ListItem button={true} onClick={handleGithubLogin} style={{ color: accentColor, background: lighterBackground }}>
        <GitHubIcon />
        &nbsp;Login With GitHub
      </ListItem>)      
  );
};

export default Login;