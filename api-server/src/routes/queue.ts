import {config as dotEnvConfig} from 'dotenv';
import express, { Request, Response } from 'express';
import { Participant } from '../models/participant';
import { authenticateParticipant } from '../controllers/participant';
import { ceremonyExists, getCeremony } from '../controllers/ceremony';
import { getQueue, joinQueue, checkinQueue, leaveQueue } from '../controllers/queue';


dotEnvConfig();

const router = express.Router();
router.use(ceremonyExists);

/**
 * @api {get} /queue/join Join the queue to contribute to the ceremony
 * @apiName QueueJoin
 * @apiGroup Queue
 * @apiDescription Participants can use this route with their JWT in the authorization header
 * to join the queue to contribute into the ceremony. Response will inform participant about
 * expected time to contribute and the last check-in time to prevent abandoned positions blocking the queue.
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
        res.json(queue);
        return;
    }
    const result = await joinQueue(participant);
    res.json(result);
});
/**
 * @api {get} /queue/checkin Check in after specific time interval to see if it is the participant turn
 * @apiName QueueCheckin
 * @apiGroup Queue
 * @apiDescription Participants can use this route to check-in in the specified date given by /queue/join
 * or /queue/checkin itself. There is a small time allowance to help participants with any issues to still
 * be able to check in correctly. If the checkin time is after the call time then the queue would be set
 * to ABSENT. If the current index of the ceremony matches the participant index then the call sends the
 * state READY to notify the participant they can start their contribution calling /contribution/start.
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
 *    "status": "READY",
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
router.get('/checkin', authenticateParticipant, async (req: Request, res: Response) => {
    const participant = req.user as Participant;
    const result = await checkinQueue(participant);
    res.json(result);
});
/**
 * @api {get} /queue/leave Intentionally leave the queue
 * @apiName QueueLeave
 * @apiGroup Queue
 * @apiDescription Participants can leave the queue voluntarily in case there is any issue in their machine.
 * The queue state is set to LEFT and participants can rejoin the queue later on. When participants are left
 * from the queue by not doing the check-in on time, then they would not be able to rejoin later.
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
 *    "status": "LEFT",
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
router.get('/leave', authenticateParticipant, async (req: Request, res: Response) => {
    const participant = req.user as Participant;
    const queue = await getQueue(participant.uid);
    const ceremony = await getCeremony();
    const result = await leaveQueue(queue, ceremony);
    res.json(result);
});

export{router};