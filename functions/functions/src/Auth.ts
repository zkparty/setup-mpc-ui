import * as functions from 'firebase-functions';

const cors = require('cors')({
    origin: true,
  });

const Auth = functions.https.onRequest((req, res) => {

    cors(req, res, () => {
        if (req.method === 'PUT') {
            res.status(403).send('Forbidden!');
            return;
        }

        const request = JSON.parse(req.body);

        functions.logger.info(`Sign-in request for ${request.ethAddress}, sig: ${request.sig}`);

        res.status(200).send('OK');
    });
})