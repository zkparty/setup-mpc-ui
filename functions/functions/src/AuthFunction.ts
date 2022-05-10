import * as functions from 'firebase-functions';
import { ethers } from 'ethers';
import { UserRecord } from 'firebase-functions/v1/auth';
const fbAdmin = require('firebase-admin');

const express = require('express');
const app = express();

// const cors = require('cors')({
//     origin: true,
//   });

const authenticate = (req: any, res: any, next: any) => {

    if (req.method === 'PUT') {
        res.status(403).send('Forbidden!');
        return;
    }
    next();
};

app.use(authenticate);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const PREFIX = '\x19Ethereum Signed Message:\n';

app.post('/', (req: any, res: any) => {

    functions.logger.info(`Sign-in request for ${req.ethAddress}, sig: ${req.sig}`);

    // ECRecover to verify signature is from the supplied address
    const message = PREFIX + 'ZKParty sign-in';
    const msgHash = ethers.utils.id(message);
    const recoveredAddress = ethers.utils.recoverAddress(msgHash, req.sig);
    if (recoveredAddress !== req.ethAddress) {
        res.status(401).send('Authorization failed');
    }

    // Is this address already registered? Then return JWT
    const auth = fbAdmin.getAuth();
    auth.getUser(req.ethAddress)
        .then((userRecord: UserRecord) => {
            console.log(`User ${req.ethAddress} found ${userRecord.toJSON()}`);
        })
        .catch((err: any) => {
            if (err instanceof Error && err.message === 'auth/invalid-id-token') {
                // Not already registered
                // Get address balance

                // Reverse lookup ENS name

            }
        });


    // Build JWT
    const additionalClaims = {};
    auth.createCustomToken(req.ethAddress, additionalClaims)
            .then((customToken: any) => {
                // Send token back to client
                res.status(200).send(customToken);
            })
            .catch((error: any) => {
                const msg = `Error creating custom token:', ${(error instanceof Error) ? error : ''}`;
                console.log(msg);
                res.status(500).send(msg);
            });

    res.status(200).send('OK');
});

exports.Auth = functions.https.onRequest(app);
