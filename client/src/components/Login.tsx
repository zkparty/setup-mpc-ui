import React, { useState, useContext } from "react";
import { AuthDispatchContext, AuthStateContext } from "../state/AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthereum  } from '@fortawesome/free-brands-svg-icons';
import GitHubIcon from "@material-ui/icons/GitHub";
import firebase from "firebase";
import { AuthButton, AuthButtonText, accentColor, lighterBackground } from "../styles";
import { Button, Checkbox, FormControlLabel, FormGroup } from "@material-ui/core";
import LoadingSpinner from "../components/LoadingSpinner";
import { getUserStatus } from "../api/FirestoreApi";
import axios from 'axios';

const Login = () => {
  const [error, setErrors] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useContext(AuthDispatchContext);
  const authState = useContext(AuthStateContext);

  if (!dispatch) return (<></>);

  const handleGithubLogin = () => {
    setIsLoading(true);
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
          .then(user => {
            userLogin(user, u => u.user?.email);
            setIsLoading(false);
          })
        })
        .catch((e: { message: React.SetStateAction<string>; }) => {
          setErrors(e.message);
          setIsLoading(false);
        })
    } catch (err) {
      if (err instanceof Error) console.warn(err.message);
      setIsLoading(false);
    }
  };

  const handleEthereumLogin = async () => {
    setIsLoading(true);
    // Check cookie
    const COOKIE_NAME = 'signed_signin_message';
    try {
      const cookie = localStorage.getItem(COOKIE_NAME);
      let signature: string, account: string;
      if (cookie) {
        const sigData = JSON.parse(cookie);
        account = sigData.ethAddress;
        signature = sigData.sig;
      } else {
        // Connect to browser wallet
        if (!window.ethereum) {
          console.error('Metamask is not installed. Signin aborted.');
          return;
        }
        const SIGNIN_MESSAGE = 'ZKParty sign-in';
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        account = accounts[0];
        console.debug(`Metamask account: ${account}`);
        // Sign message. TODO - put message in a constant that's also reachable from functions
        const signinMessage = `0x${Buffer.from(SIGNIN_MESSAGE).toString('hex')}`;
        console.log(`msg to be signed: ${signinMessage}`);
        signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [signinMessage, account],
        });

        // Save cookie
        const sigData = { ethAddress: account, sig: signature };
        localStorage.setItem(COOKIE_NAME, JSON.stringify(sigData));
      }
      console.log(`Signature: ${signature}`);

      // Get JWT
      const app = firebase.app().options as any;
      const name = app.projectId;
      const url = `https://us-central1-${name}.cloudfunctions.net/Auth-Auth`;
      const body = {
        ethAddress: account,
        sig: signature,
      }

      const response = await axios.request({
        url: url,
        method: 'post',
        data: body,
        headers: {
          'Content-Type': 'application/json',
          //'Access-Control-Allow-Origin': '*'
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
                .then(user => {
                  userLogin(user, (u) => u.user?.uid);
                  setIsLoading(false);
                })
                .catch((e: { message: React.SetStateAction<string>; }) => {
                  setErrors(e.message);
                  setIsLoading(false);
                })
          })
      }
      setIsLoading(false);
    } catch (err) {
      console.error(`Error while logging in: ${(err instanceof Error) ? err.message : ''}`);
      setIsLoading(false);
    }
  }

  // Handle a user once login has been confirmed
  //
  const userLogin = (userCred: firebase.auth.UserCredential, idGetter: (u: firebase.auth.UserCredential) => string | null | undefined) => {
    //console.debug(result);
    const project = authState.project ? authState.project : 'unknown';
    // Get user privileges
    if (userCred.user && userCred.user.uid) {
      const id = idGetter(userCred);
      if (id) {
        getUserStatus(id, project)
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
        user: { ...userCred.user, additionalUserInfo: userCred.additionalUserInfo },
      });
    }
  };

  const logOut = () => {
    firebase.auth().signOut();
  };

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'MANUAL_ATTESTATION',  option: event.target.checked });
  };

  return (
    <div>
      {isLoading ? <LoadingSpinner></LoadingSpinner> : <div>
        <AuthButton onClick={handleEthereumLogin} disabled={isLoading} style={{ marginTop: '78px', }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={faEthereum} color="#000" />
            <div style={{ width: '24px' }} />
            <AuthButtonText>Login</AuthButtonText>
          </div>
        </AuthButton>
        <AuthButton onClick={handleGithubLogin} disabled={isLoading} style={{ marginLeft: '30px',}}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GitHubIcon htmlColor="#000" />
            <div style={{ width: '24px' }} />
            <AuthButtonText>Login</AuthButtonText>
          </div>
        </AuthButton>
      </div>}
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
