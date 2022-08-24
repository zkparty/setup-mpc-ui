import {config as dotEnvConfig} from 'dotenv';
import express, { Request, Response } from 'express';
import { Participant } from '../models/participant';
import { getQueue, joinQueue } from '../controllers/queue';
import { authenticateParticipant } from '../controllers/participant';

dotEnvConfig();

const router = express.Router();

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
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "index": 0,
 *    "uid": "0xfAce669798EbFA92Ec1e47Adc86b1eA213F564bD",
 *    "status": "WAITING",
 *    "expectedTimeToStart": "2022-08-24T03:15:47.691Z",
 *    "checkingDeadline": "2022-08-24T03:16:02.945Z"
 *  }
 */
router.get('/join', authenticateParticipant, async (req: Request, res: Response) => {
    const participant = req.user as Participant;
    const queue = await getQueue(participant.uid);
    if (queue){
        res.json(queue || {});
    } else {
        const result = await joinQueue(participant);
        res.json(result);
    }
});

export{router};