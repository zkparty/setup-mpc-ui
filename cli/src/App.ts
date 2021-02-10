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
    const res = await axios.post(`https://github.com/login/device/code?client_id=${GITHUB_CLIENT_ID}&scope=read:user`);

    console.log(`Login response: ${res.data} status: ${res.status}`);
}

export default App;