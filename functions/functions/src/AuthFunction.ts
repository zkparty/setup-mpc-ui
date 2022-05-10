import * as functions from 'firebase-functions';
import { ethers } from 'ethers';
//import { UserRecord } from 'firebase-functions/v1/auth';
const fbAdmin = require('firebase-admin');

const express = require('express');
const app = express();

// const cors = require('cors')({
//     origin: true,
//   });

const authenticate = (req: any, res: any, next: any) => {

    functions.logger.debug(`req body: ${JSON.stringify(req.body)}`);
    if (req.method !== 'POST') {
        res.status(403).send('Forbidden!');
        return;
    }
    next();
};

app.use(authenticate);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.post('/', (req: any, res: any) => {

    functions.logger.debug(`POST req body: ${JSON.stringify(req.body)}`);
    const { ethAddress, sig } = req.body;
    
    functions.logger.info(`Sign-in request for ${ethAddress}, sig: ${sig}`);

    // ECRecover to verify signature is from the supplied address
    const message = 'ZKParty sign-in';
    const msgHash = ethers.utils.hashMessage(message);
    const recoveredAddress = ethers.utils.recoverAddress(msgHash, sig);
    if (recoveredAddress !== ethAddress) {
        res.status(401).send('Authorization failed');
    }

    // Is this address already registered? Then return JWT
    const auth = fbAdmin.auth();
    auth.getUser(ethAddress)
        .then((userRecord: functions.auth.UserRecord) => {
            console.log(`User ${ethAddress} found ${userRecord.toJSON()}`);
        })
        .catch((err: any) => {
            if (err.code === 'auth/user-not-found') {
                // Not already registered
                // Get address balance

                // Reverse lookup ENS name

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

exports.Auth = functions.https.onRequest(app);
