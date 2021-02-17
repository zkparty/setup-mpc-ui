import * as chalk from 'chalk';
import login from './Login';
import { getState, setState, StateChange } from './State';
import { attest, compute, download, getEntropy, joinCeremony, listCeremonies, runCeremony, upload, verify } from './Compute';

const PROMPT = 'ZKParty> ';

const commandHandler = () => {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: chalk.green(PROMPT),
    });

    rl.prompt();
    rl.on('line', async (line) => {
        await parseCommand(line.trim(), rl);
        rl.prompt();
    }).on('close', () => {
        console.log('Bye');
        process.exit(0);
    });
};

const parseCommand = async (command: string, rl) => {
    if (command && command.length > 0) {
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
                            await login();
                            break;
                        case 'logout':
                            setState(StateChange.LOGOUT);
                            break;
                        case 'list':
                            await listCeremonies();
                            break;
                        case 'join':
                            if (cmdArgs.length > 1)
                                await joinCeremony(cmdArgs[1])
                            else {
                                console.log(`Please nominate a ceremony number to join`);
                            }
                            break;
                        case 'entropy':
                            await getEntropy(rl, cmdArgs.length > 1 ? cmdArgs[1]: null);
                            break;
                        case 'download':
                            await download();
                            break;
                        case 'run':
                            setState(StateChange.AUTO_RUN);
                            await runCeremony();
                            break;
                        case 'compute':
                            await compute();
                            break;
                        case 'upload':
                            await upload();
                            break;
                        case 'verify':
                            await verify();
                            break;
                        case 'attest':
                            await attest();
                            break;
                        default: 
                            console.log(`Unrecognized command '${command}'`);
                    }
                } else {                    
                    console.log(`Command not available`);
                }
        }
    }
}

const commandIsAllowed = (cmd: string, cmdList: string[]): boolean => {
    return cmdList.some(v => cmd.startsWith(v));
}


const allowedCommands = (): string[] => {
    const state = getState();
    let cmds = ['quit', 'help', '?', 'list'];
    cmds.push( state.loggedIn ? 'logout' : 'login');
    if (state.listed) cmds.push('join');
    if (state.joined && !state.computed) {
        cmds.push('entropy');
        if (state.haveEntropy && !state.autoRun) cmds.push('run');
    }
    if (!state.autoRun) {
        if (state.joined && !state.waiting && !state.computed) cmds.push('download');
        if (state.downloaded && state.haveEntropy && !state.computed) cmds.push('compute');
        if (state.computed && !state.uploaded) cmds.push('upload');
    }
    if (state.uploaded) cmds.push('verify', 'attest');
    return cmds;
}

export default commandHandler;
