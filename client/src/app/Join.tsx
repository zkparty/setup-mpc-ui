import React, { useState, useContext } from "react";
import { AuthContext } from "./App";
import Button from "@material-ui/core/Button";
import GitHubIcon from "@material-ui/icons/GitHub";
import firebase from "firebase";
import { accentColor } from "../styles";

const Join = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setErrors] = useState("");

  const Auth = useContext(AuthContext);
  const handleForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(Auth);
    Auth.setLoggedIn(true);
  };

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
          Auth.setLoggedIn(true)
        })
        .catch((e: { message: React.SetStateAction<string>; }) => setErrors(e.message))
      })
 
  }

  return (
    <div>
      <h1>Join</h1>
      <form onSubmit={e => handleForm(e)}>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          name="email"
          type="email"
          placeholder="email"
        />
        <input
          onChange={e => setPassword(e.target.value)}
          name="password"
          value={password}
          type="password"
          placeholder="password"
        />
        <hr />
        <Button onClick={() => handleGithubLogin()} style={{ color: accentColor }}>
          <GitHubIcon />
          Login With GitHub
        </Button>

        <span>{error}</span>
      </form>
    </div>
  );
};

export default Join;