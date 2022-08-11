import express from 'express';
import morgan from 'morgan';
import {config as dotEnvConfig} from 'dotenv';
import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { router as ceremonyRoutes } from './routes/ceremony';
import serviceAccount from './firebase_skey.json';

dotEnvConfig();

initializeApp({ credential: cert(serviceAccount as ServiceAccount) });

const app = express();
const domain = process.env.DOMAIN;
const port = process.env.PORT;

app.use(express.json());
app.use(morgan('combined'));
app.use('/ceremony', ceremonyRoutes);

app.listen(port, async () => {
  console.log(`⚡️[server]: Running at https://${domain}:${port}`);
});