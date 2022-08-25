import {config as dotEnvConfig} from 'dotenv';
import express, { Request, Response } from 'express';
import { authenticateParticipant } from '../controllers/participant';
import { startContribution } from '../controllers/contribution';
import { ImplementationDetails } from '../models/contribution';
import { ceremonyExists } from '../controllers/ceremony';
import { Participant } from '../models/participant';

dotEnvConfig();
const router = express.Router();
router.use(ceremonyExists);

router.post('/start', authenticateParticipant, async (req: Request, res: Response) => {
    const participant = req.user as Participant;
    const implementationDetails = req.body as ImplementationDetails;
    const result = await startContribution(participant, implementationDetails);
    res.json(result);
});

export{router};
