import {config as dotEnvConfig} from 'dotenv';
import express, { Request, Response } from 'express';
import { abortContribution, completeContribution, startContribution } from '../controllers/contribution';
import { ImplementationDetails, Transcript } from '../models/contribution';
import { authenticateParticipant } from '../controllers/participant';
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

router.get('/abort', authenticateParticipant, async (req: Request, res: Response) => {
    const participant = req.user as Participant;
    const result = await abortContribution(participant);
    res.json(result);
});

export{router};
