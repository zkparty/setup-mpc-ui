import express, { Request, Response } from 'express';
import {config as dotEnvConfig} from 'dotenv';
import { getCeremony } from '../controllers/ceremony';

dotEnvConfig();
const domain: string = process.env.DOMAIN!;
const router = express.Router();

router.get('/status', async (req: Request, res: Response) => {
    const ceremony = await getCeremony(domain);
    res.json(ceremony);
});

export {router};