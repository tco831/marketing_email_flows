// src/app.ts
import express from 'express';
import flowRoutes from './routes/flowRoutes';

const app = express();

app.use(express.json());
app.use('/api', flowRoutes);

export default app;
