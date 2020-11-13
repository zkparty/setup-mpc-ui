import React, { useState, useContext } from "react";
//import { createBrowserHistory } from "history";
import { AuthContext } from "./App";
import Button from "@material-ui/core/Button";
import GitHubIcon from "@material-ui/icons/GitHub";
import firebase from "firebase";
import { accentColor } from "../styles";
import ListItem from "@material-ui/core/ListItem";

const Join = (props: { close: any }) => {
  const [error, setErrors] = useState("");

  const Auth = useContext(AuthContext);

  //const history = createBrowserHistory();

  const handleGithubLogin = () => {
    const provider = new firebase.auth.GithubAuthProvider();

    firebase
    .auth()
    .setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(() => {
        firebase
        .auth()
        .signInWithPopup(provider)
        .then((result: any) => {
          console.log(result)
          //this.props.history.push('/')
          Auth.setAuthUser(result);
          Auth.setLoggedIn(true);
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