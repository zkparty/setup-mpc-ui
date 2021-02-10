import firebase from "firebase/app";
import firebaseConfig from "./firebaseConfig";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import * as chalk from 'chalk';
import axios from 'axios';
import { getCeremonies} from './api/FirestoreApi';

firebase.initializeApp(firebaseConfig);
firebase.firestore().settings({ experimentalForceLongPolling: true });

require('dotenv').config();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
console.log(`GH client id: ${GITHUB_CLIENT_ID}`);

const App = async () => {
    Login();

    console.log(chalk.magenta.underline('Ceremonies'));

    //const ceremonies = await getCeremonies();

    //ceremonies.forEach(c => {
    //    console.log(chalk.green(c.title));
    //});

}

const Login = async () => {
    console.log('post...');
    const res = await axios.post(`https://github.com/login/device/code?client_id=${GITHUB_CLIENT_ID}&scope=read:user,gist`);

    console.log(`Login response: ${res.data} status: ${res.status}`);

    if (res.status>= 200 && res.status < 300) {
        const resData = parseResponse(res.data);
        console.log(chalk.bold(`Your user code is ${resData['user_code']}. Visit ${resData['verification_uri']} ` +
            `in your browser or on another device. Enter the user code to authenticate this session.` +
            ` The code will expire in ${Math.round(resData['expires_in']/60)} minutes`));
        
        const auth = await waitForAuth(resData['device_code'], resData['interval'])
            .catch(err => { 
                console.error(chalk.red(`Error waiting for authentication: ${err}`));
            });
        console.log(chalk.green(`Authentication successful! ${auth.access_token}`));
    } else {
        throw new Error(`GitHub auth request failed with response code ${res.status}`);
    }
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
                
                console.debug(`poll ${res.status} ${res.data}`);
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

export default App;