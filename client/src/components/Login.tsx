import React, { useState, useContext } from "react";
import { AuthDispatchContext, AuthStateContext } from "../state/AuthContext";
import GitHubIcon from "@material-ui/icons/GitHub";
import firebase from "firebase";
import { accentColor, lighterBackground } from "../styles";
import { Button } from "@material-ui/core";
import { getUserStatus } from "../api/FirestoreApi";
import { AuthButton, StyledButton } from './../styles';

const Login = () => {
  const [error, setErrors] = useState("");
  const dispatch = useContext(AuthDispatchContext);
  const authState = useContext(AuthStateContext);

  if (!dispatch) return (<></>);

  const handleGithubLogin = () => {
    const provider = new firebase.auth.GithubAuthProvider();

    provider.addScope('read:user');
    provider.addScope('gist');

    try {
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
            user: { ...result.user, additionalUserInfo: result.additionalUserInfo },
            accessToken: result.credential.accessToken,
          });
        })
        .catch((e: { message: React.SetStateAction<string>; }) => setErrors(e.message))
      })
    } catch (err) {
      console.warn(err.message);
    }
  };

  const logOut = () => {
    firebase.auth().signOut();
  };

  return (
    <AuthButton onClick={handleGithubLogin} style={{ marginTop: '78px', }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <GitHubIcon htmlColor="#000" />
        <div style={{ width: '24px' }} />
        <div style={{ fontFamily: 'Inconsolata', fontWeight: 'bold', fontSize: '24px', color: '#000' }}>Login</div>
      </div>
    </AuthButton>
  );
};

export default Login;
