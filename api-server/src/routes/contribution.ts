import {config as dotEnvConfig} from 'dotenv';
import express, { Request, Response } from 'express';
import { authenticateParticipant } from '../controllers/participant';
import { completeContribution, startContribution } from '../controllers/contribution';
import { ImplementationDetails, Transcript } from '../models/contribution';
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

router.post('/complete', authenticateParticipant, async (req: Request, res: Response) => {
    const participant = req.user as Participant;
    const transcript = req.body as Transcript;
    const result = await completeContribution(participant, transcript);
    res.json(result);
});

export{router};
