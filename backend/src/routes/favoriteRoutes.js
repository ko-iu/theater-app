import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Получить избранные спектакли пользователя
router.get('/performances', async (req, res) => {
  try {
    const result = await query(
      `SELECT p.* FROM performances p
       JOIN favorites f ON p.id = f.performance_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить избранных артистов пользователя
router.get('/artists', async (req, res) => {
  try {
    const result = await query(
      `SELECT a.* FROM artists a
       JOIN favorite_artists fa ON a.id = fa.artist_id
       WHERE fa.user_id = $1
       ORDER BY fa.created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавить/удалить спектакль в избранное
router.post('/performance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем, есть ли уже в избранном
    const existing = await query(
      'SELECT * FROM favorites WHERE user_id = $1 AND performance_id = $2',
      [req.userId, id]
    );
    
    if (existing.rows.length > 0) {
      // Удаляем
      await query('DELETE FROM favorites WHERE user_id = $1 AND performance_id = $2', [req.userId, id]);
      res.json({ success: true, action: 'removed' });
    } else {
      // Добавляем
      await query('INSERT INTO favorites (user_id, performance_id) VALUES ($1, $2)', [req.userId, id]);
      res.json({ success: true, action: 'added' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавить/удалить артиста в избранное
router.post('/artist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = await query(
      'SELECT * FROM favorite_artists WHERE user_id = $1 AND artist_id = $2',
      [req.userId, id]
    );
    
    if (existing.rows.length > 0) {
      await query('DELETE FROM favorite_artists WHERE user_id = $1 AND artist_id = $2', [req.userId, id]);
      res.json({ success: true, action: 'removed' });
    } else {
      await query('INSERT INTO favorite_artists (user_id, artist_id) VALUES ($1, $2)', [req.userId, id]);
      res.json({ success: true, action: 'added' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

export default router;