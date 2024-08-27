import express from 'express';
import { triggerFlow } from '../services/flowService';

const router = express.Router();

router.post('/trigger', async (req, res) => {
  const { eventName, userEmail } = req.body;

  if (!eventName || !userEmail) {
    return res.status(400).json({ message: 'eventName and userEmail are required' });
  }

  await triggerFlow(eventName, userEmail);
  res.status(200).json({ message: 'Flow triggered' });
});

export default router;
