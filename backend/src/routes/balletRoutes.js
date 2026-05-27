import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Получить все балетные элементы
router.get('/elements', async (req, res) => {
  try {
    const result = await query('SELECT * FROM ballet_elements ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить элемент по ID
router.get('/elements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM ballet_elements WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Элемент не найден' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

export default router;