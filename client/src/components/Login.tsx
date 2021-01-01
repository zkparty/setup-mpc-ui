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
      if (Auth.setAuthUser) Auth.setAuthUser(user);
      if (Auth.setLoggedIn) Auth.setLoggedIn(true);
      // Get user privileges
      if (user.email) {
        getUserPrivs(user.email)
        .then((resp: string) => {
          console.log(`privs: ${resp}`);
          //Auth.setCoordinator("COORDINATOR" === resp);
          // TODO - revert to correct test. temporary for testing
          Auth.setCoordinator(true);
        });
      }
    } else {
      Auth.setLoggedIn(false);
      Auth.setAuthUser(null);
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
          //this.props.history.push('/')
          // TODO - use reducer: dispatch LOGIN
          Auth.setAuthUser(result.user);
          Auth.setLoggedIn(true);
          Auth.setAccessToken(result.credentials.accessToken);
          // Get user privileges
          getUserPrivs(result.user.email)
            .then((resp: string) => {
              console.log(`privs: ${resp}`);
              Auth.setCoordinator("COORDINATOR" === resp);
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
    (Auth.isLoggedIn) ? 
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