import express, { Request, Response } from 'express';
import { createCeremony, getCeremony } from '../controllers/ceremony';
import { Ceremony } from '../models/ceremony';

const router = express.Router();

router.post('/create', async (req: Request, res: Response) => {
    const ceremony = req.body as Ceremony;
    const result = await createCeremony(ceremony);
    res.json(result);
});

router.get('/status', async (req: Request, res: Response) => {
    const ceremony = await getCeremony();
    res.json(ceremony);
});

export {router};