import React, { useState, useContext } from "react";
//import { createBrowserHistory } from "history";
import { AuthContext } from "../app/AuthContext";
import Button from "@material-ui/core/Button";
import GitHubIcon from "@material-ui/icons/GitHub";
import firebase from "firebase";
import { accentColor } from "../styles";
import ListItem from "@material-ui/core/ListItem";
import { Autorenew } from "@material-ui/icons";
import { getUserPrivs } from "./../api/ZKPartyApi";

const Join = (props: { close: any }) => {
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
          Auth.setCoordinator("COORDINATOR" === resp);
        });
      }
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
          Auth.setAuthUser(result.user);
          Auth.setLoggedIn(true);
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
 
  }

  return (
        <ListItem button={true} onClick={() => handleGithubLogin()} style={{ color: accentColor }}>
          <GitHubIcon />
          Login With GitHub
        </ListItem>
  );
};

export default Join;