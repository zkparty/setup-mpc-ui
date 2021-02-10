import firebase from "firebase/app";
import firebaseConfig from "./firebaseConfig";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import * as chalk from 'chalk';
import axios from 'axios';
import login from './Login';
import { getEligibleCeremonies} from './api/FirestoreApi';

firebase.initializeApp(firebaseConfig);
firebase.firestore().settings({ experimentalForceLongPolling: true });

//require('dotenv').config();

const App = async () => {
    console.log(chalk`{bold Welcome to the }{green.bold ZKPARTY} Phase 2 MPC {italic Command-Line} version`);

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.green('ZKParty> ')
    });
    
    rl.prompt();
    rl.on('line', (line) => {
        switch (line.trim()) {
          case 'login':
            console.log('login!');
            doCommand(rl);
            break;
          default:
            console.log(`Unrecognized command '${line.trim()}'`);
            break;
        }
        rl.prompt();
      }).on('close', () => {
        console.log('Have a great day!');
        process.exit(0);
      });

}

const doCommand = async (rl) => {
    const user = await login();

    getEligibleCeremonies(user.uid).then(
        ceremonies => {
            console.debug(`ceremonies: ${ceremonies.length}`);
            console.log(chalk.greenBright.underline('Ceremonies'));
            let i = 1;
            ceremonies.forEach(c => {
                console.log(chalk.green(`${i++}. ${c.title}`));
            });

            rl.question('Select> ', (sel) => {
                try {
                    const c = parseInt(sel);
                    if ((c > 0) && (c <= ceremonies.length)) {
                        console.log(`Joining ${ceremonies[c-1].title} ...`);
                    } else {
                        console.log('Invalid choice');
                    }
                } catch (err) {
                    console.log(`Error: ${err.message}`);
                }
            })
        
        });

    
    //rl.close();

}

export default App;