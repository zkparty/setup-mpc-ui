import express from 'express';
import { router as ceremonyRoutes } from './routes/ceremony';
import {config as dotEnvConfig} from 'dotenv';

dotEnvConfig();

const app = express();
const port = process.env.PORT;

app.use('/ceremony', ceremonyRoutes);

app.listen(port, () => {
  console.log(`⚡️[server]: Running at https://localhost:${port}`);
});