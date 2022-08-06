import dotenv from 'dotenv';
import express from 'express';
import { router as ceremonyRoutes } from './routes/ceremony';

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use('/ceremony', ceremonyRoutes);

app.listen(port, () => {
  console.log(`⚡️[server]: Running at https://localhost:${port}`);
});