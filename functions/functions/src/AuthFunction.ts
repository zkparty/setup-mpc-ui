import * as functions from 'firebase-functions';

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

app.post('/', (req: any, res: any) => {
    functions.logger.debug(`Method ${req.method}`);
    functions.logger.debug(`Addr ${req.body.ethAddress}`);


    //functions.logger.info(`Sign-in request for ${request.ethAddress}, sig: ${request.sig}`);

    res.status(200).send('OK');
});

exports.Auth = functions.https.onRequest(app);
