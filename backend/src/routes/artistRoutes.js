import express from 'express';
import { getAllArtists, getArtistById } from '../controllers/artistController.js';

const router = express.Router();

router.get('/', getAllArtists);
router.get('/:id', getArtistById);

export default router;