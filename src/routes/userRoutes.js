import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Получить профиль пользователя
router.get('/profile', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, phone, first_name, last_name, avatar_url, role, created_at FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar_url: user.avatar_url,
      role: user.role,
      created_at: user.created_at,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить профиль
router.put('/profile', async (req, res) => {
  try {
    const { firstName, lastName, phone, email } = req.body;
    
    // Строим запрос динамически
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (firstName !== undefined) {
      updates.push(`first_name = $${paramIndex++}`);
      values.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push(`last_name = $${paramIndex++}`);
      values.push(lastName);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: 'Нет данных для обновления' });
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.userId);
    
    const queryText = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING id, email, phone, first_name, last_name, avatar_url, role
    `;
    
    const result = await query(queryText, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar_url: user.avatar_url,
      role: user.role,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить избранные спектакли
router.get('/favorites/performances', async (req, res) => {
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

// Получить избранных артистов
router.get('/favorites/artists', async (req, res) => {
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
router.post('/favorites/performance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = await query(
      'SELECT * FROM favorites WHERE user_id = $1 AND performance_id = $2',
      [req.userId, id]
    );
    
    if (existing.rows.length > 0) {
      await query('DELETE FROM favorites WHERE user_id = $1 AND performance_id = $2', [req.userId, id]);
      res.json({ success: true, action: 'removed' });
    } else {
      await query('INSERT INTO favorites (user_id, performance_id) VALUES ($1, $2)', [req.userId, id]);
      res.json({ success: true, action: 'added' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавить/удалить артиста в избранное
router.post('/favorites/artist/:id', async (req, res) => {
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