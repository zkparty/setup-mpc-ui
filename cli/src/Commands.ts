import * as chalk from 'chalk';
import login from './Login';
import { getState, setState, StateChange } from './State';
import { getCeremonies, getEligibleCeremonies} from './api/FirestoreApi';

const commandHandler = () => {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: chalk.green('ZKParty> ')
    });

    rl.prompt();
    rl.on('line', (line) => {
        const command = line.trim();
        const cmdList = allowedCommands();
        switch (command) {
            case 'help':
            case '?':
                console.log(`Available commands: ${cmdList}`);
                break;
            case 'quit':
                rl.close();
                break;
            default:
                if (commandIsAllowed(command, cmdList)) {
                    const cmdArgs = command.split(' ');
                    switch (cmdArgs[0]) {
                        case 'login': 
                            login();
                            break;
                        case 'logout':
                            setState(StateChange.LOGOUT);
                            break;
                        case 'list':
                            listCeremonies();
                            break;
                        case 'join':
                            if (cmdArgs.length > 1)
                                joinCeremony(cmdArgs[1])
                            else {
                                console.log(`Please nominate a ceremony number to join`);
                            }
                            break;
                        case 'entropy':
                            getEntropy(rl, cmdArgs.length > 1 ? cmdArgs[1]: null);
                            break;
                        case 'download':
                            download();
                            break;
                        case 'run':
                            runCeremony();
                            break;
                        case 'compute':
                            compute();
                            break;
                        case 'upload':
                            upload();
                            break;
                        case 'verify':
                            verify();
                            break;
                        case 'attest':
                            attest();
                            break;
                        default: 
                            console.log(`Unrecognized command '${command}'`);
                    }
                } else {
                    console.log(`Command not available`);
                }
                break;
        }
        rl.prompt();
    }).on('close', () => {
        console.log('Bye');
        process.exit(0);
    });
};

const commandIsAllowed = (cmd: string, cmdList: string[]): boolean => {
    return cmdList.some(v => cmd.startsWith(v));
}


const allowedCommands = (): string[] => {
    const state = getState();
    let cmds = ['quit', 'help', '?', 'list'];
    cmds.push( state.loggedIn ? 'logout' : 'login');
    if (state.listed) cmds.push('join');
    if (state.joined && !state.computed) cmds.push('entropy', 'run');
    if (state.joined && !state.waiting && !state.computed) cmds.push('download');
    if (state.downloaded && state.haveEntropy && !state.computed) cmds.push('compute');
    if (state.computed) cmds.push('upload');
    if (state.uploaded) cmds.push('verify', 'attest');
    return cmds;
}

const listCeremonies = async () => {
    const state = getState();

    let ceremonies = [];
    if (state.loggedIn) {
        ceremonies = await getEligibleCeremonies(state.user.uid)
        console.debug(`ceremonies: ${ceremonies.length}`);
        setState(StateChange.LISTED, ceremonies);
    } else {
        ceremonies = await getCeremonies();
    }
    console.log(chalk.greenBright.underline('Ceremonies'));
    let i = 1;
    ceremonies.forEach(c => {
        console.log(chalk.green(`${i++}. ${c.title}`));
    });
};


const joinCeremony = async (arg: string) => {
    const state = getState();
    try {
        const c = parseInt(arg);
        if ((c > 0) && (c <= state.ceremonyList.length)) {
            console.log(`Joining ${state.ceremonyList[c-1].title} ...`);
            setState(StateChange.JOINED, c-1);
        } else {
            console.log('Invalid argument');
        }
    } catch (err) {
        console.log(`Error: ${err.message}`);
    }
};

const getEntropy = (rl, arg?: string) => {
    if (arg && arg.length > 1) {
        setState(StateChange.SET_ENTROPY, arg);
        return;
    }
    // Collect entropy
    rl.question(
        'Entropy an entropy string', (ent: string) => {
            if (ent && ent.length>0) {
                setState(StateChange.SET_ENTROPY, ent);
            }
        }
    );
};

const download = () => {};

const compute = () => {};

const runCeremony = () => {};

const upload = () => {};

const verify = () => {};

const attest = () => {};

export default commandHandler;
