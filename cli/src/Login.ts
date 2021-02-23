import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import * as chalk from 'chalk';
import axios from 'axios';
import { setState, StateChange } from './State';
import * as fs from 'fs';

require('dotenv').config();
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;

const login = async (): Promise<firebase.User> => {

    // Get creds from previously saved data if any
    let credential: firebase.auth.OAuthCredential | undefined = await getCreds();

    if (!credential) {
        credential = await authenticate();
    }

    if (credential) {
        // Sign in with the credential from the user.
        const result = await firebase.auth()
            .signInWithCredential(credential)
            .catch((error) => {
                // Handle Errors here.
                //const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                //const email = error.email;
                throw new Error(`Firebase auth request failed: ${errorMessage}`);
            });
        
        // Signed in 
        console.log(chalk.green.bold(`You're signed in as ${result.additionalUserInfo?.username}`));
        setState(StateChange.LOGIN, {...result.user, ...result.additionalUserInfo, ...result.credential });
        return result.user;
    }
}

const authenticate = async () => {
    console.log(`login...${GITHUB_CLIENT_ID}`);
    const res = await axios.post(`https://github.com/login/device/code?client_id=${GITHUB_CLIENT_ID}&scope=read:user,gist`);

    //console.log(`Login response: ${res.data} status: ${res.status}`);

    if (res.status>= 200 && res.status < 300) {
        const resData = parseResponse(res.data);
        const verificationUrl = decodeURIComponent(resData['verification_uri']);
        console.log(chalk`\nYour user code is {green.bold ${resData['user_code']}}. Visit {green ${verificationUrl}} ` +
            `in your browser or on another device. Enter the user code to authenticate this session.` +
            ` The code will expire in ${Math.round(resData['expires_in']/60)} minutes\n`);
        
        const auth = await waitForAuth(resData['device_code'], resData['interval'])
            .catch(err => { 
                console.error(chalk.red(`Error waiting for authentication: ${err}`));
            });
        console.log(chalk.green(`Authentication successful! ${auth.access_token}`));

        var credential = firebase.auth.GithubAuthProvider.credential(auth.access_token);
        console.debug(credential.toJSON())
        saveCreds(JSON.stringify(credential.toJSON()));
        
        return credential;
    } else {
        throw new Error(`GitHub auth request failed with response code ${res.status}`);
    }
}

const saveCreds = async (cred: string) => {
    fs.writeFile('.data', cred,
        function(err) {
            if (err) throw err;
            // if no error
            console.log("Creds written to file successfully.")
        });
}

const getCreds = async (): Promise<firebase.auth.OAuthCredential> => {
    return new Promise((resolve, reject) => {
        fs.readFile('.data', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    resolve(null);
                }
                reject(err)
            }
            else {
                //const cred = data.toJSON();
                resolve(firebase.auth.AuthCredential.fromJSON(data.toString()));
            }
    })});
}

const parseResponse = (data: string):any => {
    const resData: string[] = data.split('&');
    const resp = {};
    resData.forEach(element => {
        const entry = element.split('=');
        resp[entry[0]] = entry[1];
    });
    return resp;
}

const waitForAuth = async (deviceId: string, duration: number): Promise<any> => {
    console.debug(`waitforAuth ${deviceId} ${duration}`);
    return new Promise((resolve, reject) => {
        let intervalTimer;

        const finish = (resp: any, rejekt?: boolean) => {
            clearInterval(intervalTimer);
            if (rejekt) reject(resp)
            else resolve(resp);
        };

        const restart = (interval: number) => {
            clearInterval(intervalTimer);
            start(interval);
        }

        const start = (interval: number) => {
            intervalTimer = setInterval(async () => {
                const res = await axios.post(`https://github.com/login/oauth/access_token` +
                    `?client_id=${GITHUB_CLIENT_ID}` +
                    `&device_code=${deviceId}` +
                    `&grant_type=urn:ietf:params:oauth:grant-type:device_code`);
                
                //console.debug(`poll ${res.status} ${res.data}`);
                const resp = parseResponse(res.data);
                const errorCode = resp['error'];
                if (errorCode) {
                    switch (errorCode) {
                        case 'authorization_pending': break;
                        case 'slow_down': restart(resp['interval']); break;
                        case 'expired_token': 
                        case 'access_denied': finish(errorCode, true); break;
                        default: console.warn(`Error waiting for auth: ${errorCode}`);
                    }
                } else {
                    finish(resp);
                }
            }, interval * 1000);
        }

        start(duration);
    });
}

export default login;