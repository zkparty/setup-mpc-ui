import React, { useState, useContext } from "react";
import { AuthContext } from "./App";
import Button from "@material-ui/core/Button";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setErrors] = useState("");

  const Auth = useContext(AuthContext);
  function handleForm(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        console.log(Auth);
        Auth.setLoggedIn(true);
    }

  return (
    <div>
      <h1>Login</h1>
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
        <Button >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
            alt="logo"
          />
          Login With GitHub
        </Button>
        <Button type="submit">Login</Button>
        <span>{error}</span>
      </form>
    </div>
  );
};

export default Login;