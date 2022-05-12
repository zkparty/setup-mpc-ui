import * as functions from 'firebase-functions';
import { ethers } from 'ethers';
const { AUTH_MESSAGE } = require('./types/constants');

const fbAdmin = require('firebase-admin');

const express = require('express');
const app = express();

const cors = require('cors');//({
//     origin: true,
//   });

const authenticate = (req: any, res: any, next: any) => {

    //functions.logger.debug(`req body: ${JSON.stringify(req.body)}`);
    functions.logger.debug(`req method: ${req.method}`);

    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        //functions.logger.debug(`OPTIONS request`);
    } else if (req.method === 'POST') {
        if (req.body.ethAddress === undefined || req.body.sig === undefined) {
            res.status(400).send('Invalid request');
            return;
        }
    } else {
        functions.logger.info(`Disallowed method: ${req.method}`);
        res.status(403).send('Forbidden!');
        return;
    }
    next();
};

app.use(authenticate);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({ 
    origin: true,
    methods: 'POST',
}));

app.post('/', (req: any, res: any) => {

    const { ethAddress, sig } = req.body;
    
    functions.logger.info(`Sign-in request for ${ethAddress}, sig: ${sig}`);

    // ECRecover to verify signature is from the supplied address
    const msgHash = ethers.utils.hashMessage(AUTH_MESSAGE);
    const recoveredAddress = ethers.utils.recoverAddress(msgHash, sig);
    functions.logger.debug(`recovered: ${recoveredAddress}`);
    if (recoveredAddress !== ethAddress) {
        res.status(401).send('Authorization failed');
        return;
    }

    // Is this address already registered? Then return JWT
    const auth = fbAdmin.auth();
    auth.getUser(ethAddress)
        .then((userRecord: functions.auth.UserRecord) => {
            functions.logger.info(`User ${ethAddress} found: ${userRecord.displayName}`);
        })
        .catch((err: any) => {
            if (err.code === 'auth/user-not-found') {
                // Not already registered
                // Get address balance

                // Reverse lookup ENS name

                // If OK, create user
                functions.logger.debug('Creating user');
                auth
                    .createUser({
                        uid: ethAddress,
                        displayName: ethAddress,
                    })
                    .then((userRecord: functions.auth.UserRecord) => {
                        // See the UserRecord reference doc for the contents of userRecord.
                        functions.logger.info('Successfully created new user:', userRecord.uid);
                    })
                    .catch((error: any) => {
                        functions.logger.info('Error creating new user:', error);
                    });

            } else {
                functions.logger.error(`Unexpected error in getUser: ${JSON.stringify(err)}`);
                res.status(500).send(`Error in getUser: ${err}`);
                return;
            }
        });


    // Build JWT
    const additionalClaims = {};
    auth.createCustomToken(ethAddress, additionalClaims)
            .then((customToken: any) => {
                // Send token back to client
                res.status(200).send(customToken);
            })
            .catch((error: any) => {
                const msg = `Error creating custom token:', ${(error instanceof Error) ? error : ''}`;
                console.log(msg);
                res.status(500).send(msg);
            });

});

app.options('/', (req: any, res: any) => {
    functions.logger.debug(`options request`);
});

exports.Auth = functions.https.onRequest(app);
