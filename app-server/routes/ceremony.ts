import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
router.get('/status', (req: Request, res: Response) => {
    res.json({'message': 'ok'});
});

export {router};