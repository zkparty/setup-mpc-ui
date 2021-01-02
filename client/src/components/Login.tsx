import React, { useState, useContext } from "react";
import { AuthContext } from "../app/AuthContext";
import Button from "@material-ui/core/Button";
import GitHubIcon from "@material-ui/icons/GitHub";
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import firebase from "firebase";
import { accentColor, lighterBackground } from "../styles";
import ListItem from "@material-ui/core/ListItem";
import { getUserPrivs } from "../api/ZKPartyApi";
import { ListItemIcon } from "@material-ui/core";

const Login = (props: { close: any }) => {
  const [error, setErrors] = useState("");
  const Auth = useContext(AuthContext);

  firebase.auth().onAuthStateChanged(user => {
    console.log(`auth state changed: ${user?.displayName}`);
    if (user) {
      // Get user privileges
      if (user.email) {
        getUserPrivs(user.email)
          .then((resp: string) => {
            console.log(`privs: ${resp}`);
            //Auth.setCoordinator("COORDINATOR" === resp);
            // TODO - revert to correct test. temporary for testing
            Auth.dispatch({type: 'SET_COORDINATOR'});
          });
      }
      // Auth.dispatch({
      //   type: 'LOGIN',
      //   user: user,
      //   accessToken: user.credentials.accessToken;
      // });
  } else {
      Auth.dispatch(
        {type: 'LOGOUT'}
      );
    }
  });
  
  //const history = createBrowserHistory();

  const handleGithubLogin = () => {
    const provider = new firebase.auth.GithubAuthProvider();

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
          getUserPrivs(result.user.email)
            .then((resp: string) => {
              console.log(`privs: ${resp}`);
              if (resp === 'COORDINATOR') {
                Auth.dispatch({type: 'SET_COORDINATOR'})
              }
          });
          Auth.dispatch({
            type: 'LOGIN',
            user: result.user,
            accessToken: result.credentials.accessToken,
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
    (Auth.state.isLoggedIn) ? 
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