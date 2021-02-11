import firebase from "firebase/app";
import firebaseConfig from "./firebaseConfig";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import * as chalk from 'chalk';
import commandHandler from './Commands';

firebase.initializeApp(firebaseConfig);
firebase.firestore().settings({ experimentalForceLongPolling: true });

const App = async () => {
    console.log(chalk`{bold Welcome to the }{green.bold ZKPARTY} Phase 2 MPC {italic Command-Line} version`);

    commandHandler();
}

export default App;