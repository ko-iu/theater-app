import express from 'express';
import { getAllPerformances, getPerformanceById } from '../controllers/performanceController.js';

const router = express.Router();

router.get('/', getAllPerformances);
router.get('/:id', getPerformanceById);

export default router;