import express from 'express';
import { query } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Публичные маршруты (не требуют авторизации)
router.get('/quiz', async (req, res) => {
  try {
    const questionsResult = await query('SELECT * FROM quiz_questions ORDER BY created_at');
    
    const questions = [];
    for (const q of questionsResult.rows) {
      const optionsResult = await query(
        'SELECT option_text as text, option_value as value FROM quiz_options WHERE question_id = $1',
        [q.id]
      );
      
      questions.push({
        id: q.id,
        question: q.question,
        options: optionsResult.rows,
      });
    }
    
    res.json(questions);
  } catch (error) {
    console.error('Error in /quiz:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Публичный маршрут для получения квадратов бинго
router.get('/bingo/squares', async (req, res) => {
  try {
    const result = await query('SELECT text FROM bingo_squares_settings ORDER BY position');
    
    if (result.rows.length > 0) {
      const squares = result.rows.map(r => r.text);
      return res.json(squares);
    }
    
    const defaultSquares = [
      'Увидел(а) овации', 'Услышал(а) "Браво!"', 'Увидел(а) дирижера', 'Стал(а) свидетелем пируэта',
      'Услышал(а) арию', 'Человек с биноклем', 'Аплодировала', 'Насладилась оркестром',
      'FREE', 'Увидел(а) костюм с перьями', 'Услышал(а) дуэт', 'Увидел(а) гранд жэтэ',
      'Восхитился(ась) декорациями', 'Увидел(а) любимого артиста', 'Взял(а) программу', 'Досмотрел(а) до конца'
    ];
    res.json(defaultSquares);
  } catch (error) {
    console.error('Error in /bingo/squares:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// ========== ЗАЩИЩЕННЫЕ МАРШРУТЫ (требуют авторизацию) ==========

// Сохранить результат теста
router.post('/quiz/submit', authMiddleware, async (req, res) => {
  try {
    const { answers, recommendedPerformanceId } = req.body;
    const userId = req.userId;
    
    const result = await query(
      'INSERT INTO quiz_results (user_id, result_performance_id, answers) VALUES ($1, $2, $3) RETURNING id',
      [userId, recommendedPerformanceId, JSON.stringify(answers)]
    );
    
    res.json({ success: true, resultId: result.rows[0].id });
  } catch (error) {
    console.error('Error in /quiz/submit:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить сохраненное состояние бинго пользователя
router.get('/bingo/state', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    const result = await query(
      'SELECT squares, completed_squares, is_completed, created_at FROM bingo_cards WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.json({ success: true, hasSaved: false });
    }
    
    res.json({
      success: true,
      hasSaved: true,
      squares: result.rows[0].squares,
      completedSquares: result.rows[0].completed_squares,
      isCompleted: result.rows[0].is_completed,
      updatedAt: result.rows[0].created_at,
    });
  } catch (error) {
    console.error('Failed to load bingo state:', error);
    res.status(500).json({ message: 'Ошибка сервера: ' + error.message });
  }
});

// Сохранить состояние бинго пользователя
router.post('/bingo/state', authMiddleware, async (req, res) => {
  try {
    const { squares, completedSquares, isCompleted } = req.body;
    const userId = req.userId;
    
    // Проверяем, есть ли уже запись
    const existing = await query(
      'SELECT id FROM bingo_cards WHERE user_id = $1',
      [userId]
    );
    
    if (existing.rows.length > 0) {
      await query(
        `UPDATE bingo_cards 
         SET squares = $1, completed_squares = $2, is_completed = $3 
         WHERE user_id = $4`,
        [JSON.stringify(squares), JSON.stringify(completedSquares), isCompleted, userId]
      );
    } else {
      await query(
        `INSERT INTO bingo_cards (user_id, squares, completed_squares, is_completed) 
         VALUES ($1, $2, $3, $4)`,
        [userId, JSON.stringify(squares), JSON.stringify(completedSquares), isCompleted]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save bingo state:', error);
    res.status(500).json({ message: 'Ошибка сервера: ' + error.message });
  }
});

// Сбросить бинго (начать новую игру)
router.post('/bingo/reset', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Получаем дефолтные квадраты из настроек
    let defaultSquares;
    const settingsResult = await query('SELECT text FROM bingo_squares_settings ORDER BY position');
    
    if (settingsResult.rows.length > 0) {
      defaultSquares = settingsResult.rows.map(r => r.text);
    } else {
      defaultSquares = [
        'Увидел(а) овации', 'Услышал(а) "Браво!"', 'Увидел(а) дирижера', 'Стал(а) свидетелем пируэта',
        'Услышал(а) арию', 'Человек с биноклем', 'Аплодировал(а)', 'Насладился(ась) оркестром',
        'FREE', 'Увидел(а) костюм с перьями', 'Услышал(а) дуэт', 'Увидел(а) гранд жэтэ',
        'Восхитился(ась) декорациями', 'Увидел(а) любимого артиста', 'Взял(а) программу', 'Досмотрел(а) до конца'
      ];
    }
    
    const emptyCompleted = new Array(defaultSquares.length).fill(false);
    
    // Проверяем, есть ли уже запись
    const existing = await query(
      'SELECT id FROM bingo_cards WHERE user_id = $1',
      [userId]
    );
    
    if (existing.rows.length > 0) {
      await query(
        `UPDATE bingo_cards 
         SET squares = $1, completed_squares = $2, is_completed = $3 
         WHERE user_id = $4`,
        [JSON.stringify(defaultSquares), JSON.stringify(emptyCompleted), false, userId]
      );
    } else {
      await query(
        `INSERT INTO bingo_cards (user_id, squares, completed_squares, is_completed) 
         VALUES ($1, $2, $3, $4)`,
        [userId, JSON.stringify(defaultSquares), JSON.stringify(emptyCompleted), false]
      );
    }
    
    res.json({ success: true, squares: defaultSquares, completedSquares: emptyCompleted });
  } catch (error) {
    console.error('Failed to reset bingo:', error);
    res.status(500).json({ message: 'Ошибка сервера: ' + error.message });
  }
});

export default router;