import express, { Request, Response } from 'express';
import { createCeremony, getCeremony } from '../controllers/ceremony';
import { Ceremony } from '../models/ceremony';

const router = express.Router();

/**
 * @api {post} /ceremony/create Create a new ceremony
 * @apiName createCeremony
 * @apiGroup Ceremony
 * @apiDescription This method can be called only once by the ceremony coordinator.
 * In case another ceremony needs to be performed, a new API server should be deployed.
 * @apiBody {String} title="A Test Ceremony"
 * @apiBody {String} description="This is a test for API development"
 * @apiBody {String} circuitFileName="fileNameGoesHere"
 * @apiBody {String} mode="POWERSOFTAU"
 * @apiBody {String} instructions="Enter the text content instructions to show to participants"
 * @apiBody {String} github="https://github.com/zkparty/setup-mpc-ui"
 * @apiBody {String} homepage="https://trustedsetuptest.web.app"
 * @apiBody {String} adminAddr="admin@example.com"
 * @apiBody {Number} startTime="1660168996428"
 * @apiBody {Number} endTime="1660169996428"
 * @apiBody {Number} minParticipants="2"
 * @apiSuccess {Object} _writeTime firestore saving result response
 * @apiSuccess {Number} _writeTime._seconds
 * @apiSuccess {Number} _writeTime._nanoseconds
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "_writeTime": {
 *      "_seconds": 1660170237,
 *      "_nanoseconds": 176469000
 *    }
 *  }
 * @apiError {Number} code
 * @apiError {String} message
 * @apiErrorExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "code": -1,
 *    "message": "Ceremony is already created"
 *  }
 */
router.post('/create', async (req: Request, res: Response) => {
    const createdCeremony = await getCeremony();
    if (createdCeremony){
        res.json({code: -1, message: 'Ceremony is already created'});
    } else {
        const ceremony = req.body as Ceremony;
        const result = await createCeremony(ceremony);
        res.json(result);
    }
});

/**
 * @api {get} /ceremony/status Retrieve status of ceremony
 * @apiName statusCeremony
 * @apiGroup Ceremony
 * @apiDescription Get the status information of the server ceremony
 * @apiSuccess {Object} status firestore result response
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "status": {
 *      "title": "A Test Ceremony",
 *      "description": "This is a test for API development",
 *      ...
 *    }
 *  }
 */
router.get('/status', async (_req: Request, res: Response) => {
    const ceremony = await getCeremony();
    res.json(ceremony || {});
});

export {router};