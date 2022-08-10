import express, { Request, Response } from 'express';
import {config as dotEnvConfig} from 'dotenv';
import { getCeremony } from '../controllers/ceremony';

dotEnvConfig();

const router = express.Router();

router.get('/status', async (req: Request, res: Response) => {
    // TODO: define if API works with only one ceremony or more than one
    const ceremony = await getCeremony('3');
    res.json(ceremony);
});

export {router};