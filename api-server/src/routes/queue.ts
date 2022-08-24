import {config as dotEnvConfig} from 'dotenv';
import express, { Request, Response } from 'express';
import { Participant } from '../models/participant';
import { ceremonyExists } from '../controllers/ceremony';
import { authenticateParticipant } from '../controllers/participant';
import { getQueue, joinQueue, checkinQueue } from '../controllers/queue';


dotEnvConfig();

const router = express.Router();
router.use(ceremonyExists);

/**
 * @api {get} /queue/join Join the queue to contribute to the ceremony
 * @apiName QueueJoin
 * @apiGroup Queue
 * @apiDescription Participants can use this route with their JWT in the authorization header
 * to join the queue to contribute into the ceremony. Response will inform participant about
 * expected time to contribute and the last check-in time to prevent abandoned positions blocking the queue
 * @apiSuccess {Number} index
 * @apiSuccess {String} uid
 * @apiSuccess {String} status
 * @apiSuccess {Object} expectedTimeToStart firestore timestamp (use seconds to build a Date object)
 * @apiSuccess {Number} expectedTimeToStart._seconds
 * @apiSuccess {Number} expectedTimeToStart._nanoseconds
 * @apiSuccess {Object} checkingDeadline firestore timestamp (use seconds to build a Date object)
 * @apiSuccess {Number} checkingDeadline._seconds
 * @apiSuccess {Number} checkingDeadline._nanoseconds
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "index": 0,
 *    "uid": "0xfAce669798EbFA92Ec1e47Adc86b1eA213F564bD",
 *    "status": "WAITING",
 *    "expectedTimeToStart": {
 *      "_seconds": 1660170237,
 *      "_nanoseconds": 176469000
 *    },
 *    "checkingDeadline": {
 *      "_seconds": 1660270237,
 *      "_nanoseconds": 176469000
 *    }
 *  }
 */
router.get('/join', authenticateParticipant, async (req: Request, res: Response) => {
    const participant = req.user as Participant;
    const queue = await getQueue(participant.uid);
    if (queue){
        res.json(queue || {});
        return;
    }
    const result = await joinQueue(participant);
    res.json(result);
});

router.get('/checkin', authenticateParticipant, async (req: Request, res: Response) => {
    const participant = req.user as Participant;
    const result = await checkinQueue(participant);
    res.json(result);
});

export{router};