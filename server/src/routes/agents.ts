import express from 'express';
import { protect } from '../middleware/auth.js';
import { getAgents, createAgent, updateAgent, deleteAgent } from '../controllers/agents.js';

const router = express.Router();

router.get('/', protect, getAgents);
router.post('/', protect, createAgent);
router.put('/:id', protect, updateAgent);
router.delete('/:id', protect, deleteAgent);

export default router;
