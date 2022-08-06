import express, { Request, Response } from 'express';
import {config as dotEnvConfig} from 'dotenv';
dotEnvConfig();

const router = express.Router();
router.get('/status', (req: Request, res: Response) => {
    res.json({'message': 'ok'});
});

export {router};