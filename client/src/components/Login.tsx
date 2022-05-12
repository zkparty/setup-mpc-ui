import React, { useState, useContext } from "react";
import { AuthDispatchContext, AuthStateContext } from "../state/AuthContext";
import GitHubIcon from "@material-ui/icons/GitHub";
import firebase from "firebase";
import { accentColor, lighterBackground } from "../styles";
import { Button, Checkbox, FormControlLabel, FormGroup } from "@material-ui/core";
import { getUserStatus } from "../api/FirestoreApi";
import { AuthButton, AuthButtonText } from './../styles';
import axios from 'axios';

const Login = () => {
  const [error, setErrors] = useState("");
  const dispatch = useContext(AuthDispatchContext);
  const authState = useContext(AuthStateContext);

  if (!dispatch) return (<></>);

  const handleGithubLogin = () => {
    const provider = new firebase.auth.GithubAuthProvider();

    provider.addScope('read:user');
    if (!authState.manualAttestation) provider.addScope('gist');

    const project = authState.project ? authState.project : 'unknown';

    try {
      firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.NONE)
        .then(() => {
          firebase
          .auth()
          .signInWithPopup(provider)
          .then((result: any) => {
            //console.debug(result);
            // Get user privileges
            getUserStatus(result.user.email, project)
              .then((resp: string) => {
                console.log(`privs: ${resp}`);
                if (resp === 'COORDINATOR') {
                  dispatch({type: 'SET_COORDINATOR'})
                }
            });
            //console.debug(`dispatch LOGIN`);
            dispatch({
              type: 'LOGIN',
              user: { ...result.user, additionalUserInfo: result.additionalUserInfo },
              accessToken: result.credential.accessToken,
            });
          })
          .catch((e: { message: React.SetStateAction<string>; }) => setErrors(e.message))
        })
    } catch (err) {
      if (err instanceof Error) console.warn(err.message);
    }
  };

  const handleEthereumLogin = async () => {
    // Check cookie
    // Connect to browser wallet
    if (!window.ethereum) {
      console.error('Metamask is not installed. Signin aborted.');
      return;
    }
    const project = authState.project ? authState.project : 'unknown';
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      console.debug(`Metamask account: ${account}`);
      // Sign message. TODO - put message in a constant that's also reachable from functions
      const signinMessage = `0x${Buffer.from('ZKParty sign-in').toString('hex')}`;
      console.log(`msg to be signed: ${signinMessage}`);
      const sign = await window.ethereum.request({
        method: 'personal_sign',
        params: [signinMessage, account],
      });
      console.log(`Signature: ${sign}`);
      // Save cookie
      // Get JWT
      const app = firebase.app().options as any;
      const name = app.projectId;
      const url = `https://us-central1-${name}.cloudfunctions.net/Auth-Auth`;
      const body = {
        ethAddress: account,
        sig: sign,
      }

      const response = await axios.request({
        url: url,
        method: 'post',
        data: body,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

      if (response.status < 300) {
        console.log(`JWT Response ${response.data}`);
        // Sign in
        firebase
          .auth()
          .setPersistence(firebase.auth.Auth.Persistence.NONE)
          .then(() => {
            firebase
              .auth()
              .signInWithCustomToken(response.data)
                .then((result: firebase.auth.UserCredential) => {
                  //console.debug(result);
                  // Get user privileges
                  if (result.user && result.user.uid) {
                    getUserStatus(result.user.uid, project)
                      .then((resp: string) => {
                        console.log(`privs: ${resp}`);
                        if (resp === 'COORDINATOR') {
                          dispatch({type: 'SET_COORDINATOR'})
                        }
                    });
                  }
                  //console.debug(`dispatch LOGIN`);
                  dispatch({
                    type: 'LOGIN',
                    user: { ...result.user, additionalUserInfo: result.additionalUserInfo },
                  });
                })
                .catch((e: { message: React.SetStateAction<string>; }) => setErrors(e.message))
              })

      } 
    } catch (err) {
      console.error(`Error while logging in: ${(err instanceof Error) ? err.message : ''}`);
    }
  }

  const logOut = () => {
    firebase.auth().signOut();
  };

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'MANUAL_ATTESTATION',  option: event.target.checked });
  };

  return (
    <div>
      <AuthButton onClick={handleEthereumLogin} style={{ marginTop: '78px', }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GitHubIcon htmlColor="#000" />
          <div style={{ width: '24px' }} />
          <AuthButtonText>Login</AuthButtonText>
        </div>
      </AuthButton>
      {/* <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox
              checked={authState.manualAttestation}
              onChange={handleOptionChange}
              name="attest"
              color={"primary"}
            />
          }
          label="Manual attestation"
          style={{ display: 'flex', alignItems: 'center', marginTop: '30px' }}
        />
      </FormGroup> */}
    </div>
  );
};

export default Login;
