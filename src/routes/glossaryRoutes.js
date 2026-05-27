import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Получить все термины
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM glossary_terms ORDER BY term');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить термин по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM glossary_terms WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Термин не найден' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

export default router;