import express from 'express';
import {
  createPerformance,
  updatePerformance,
  deletePerformance,
  createArtist,
  updateArtist,
  deleteArtist,
  createGlossaryTerm,
  updateGlossaryTerm,
  deleteGlossaryTerm,
  createBalletElement,
  updateBalletElement,
  deleteBalletElement,
  getQuizQuestionsAdmin,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  getBingoSquaresAdmin,
  updateBingoSquares
} from '../controllers/adminController.js';

const router = express.Router();

// Спектакли
router.post('/performances', createPerformance);
router.put('/performances/:id', updatePerformance);
router.delete('/performances/:id', deletePerformance);

// Артисты
router.post('/artists', createArtist);
router.put('/artists/:id', updateArtist);
router.delete('/artists/:id', deleteArtist);

// Словарь
router.post('/glossary', createGlossaryTerm);
router.put('/glossary/:id', updateGlossaryTerm);
router.delete('/glossary/:id', deleteGlossaryTerm);

// Балетные элементы
router.post('/ballet', createBalletElement);
router.put('/ballet/:id', updateBalletElement);
router.delete('/ballet/:id', deleteBalletElement);

// Вопросы теста
router.get('/quiz', getQuizQuestionsAdmin);
router.post('/quiz', createQuizQuestion);
router.put('/quiz/:id', updateQuizQuestion);
router.delete('/quiz/:id', deleteQuizQuestion);

// Бинго
router.get('/bingo', getBingoSquaresAdmin);
router.put('/bingo', updateBingoSquares);

export default router;