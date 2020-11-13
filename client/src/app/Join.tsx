import React, { useState, useContext } from "react";
import { AuthContext } from "./App";
import Button from "@material-ui/core/Button";
import GitHubIcon from "@material-ui/icons/GitHub";
import firebase from "firebase";
import { accentColor } from "../styles";

const Join = () => {
  const [error, setErrors] = useState("");

  const Auth = useContext(AuthContext);

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
          //history.push('/')
          Auth.setLoggedIn(true);
          Auth.setAuthUser(result);
        })
        .catch((e: { message: React.SetStateAction<string>; }) => setErrors(e.message))
      })
 
  }

  return (
    <div>
      <h1>Login</h1>
        <Button onClick={() => handleGithubLogin()} style={{ color: accentColor }}>
          <GitHubIcon />
          Login With GitHub
        </Button>

        <span>{error}</span>
    </div>
  );
};

export default Join;