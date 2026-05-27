import { query } from '../config/database.js';
import fs from 'fs';
import path from 'path';

// ========== СПЕКТАКЛИ ==========
export const createPerformance = async (req, res) => {
  try {
    const { title, type, description, short_description, history, duration, date, time, image_url, is_featured } = req.body;
    
    const result = await query(
      `INSERT INTO performances (title, type, description, short_description, history, duration, date, time, image_url, is_featured) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [title, type, description, short_description, history, duration, date, time, image_url, is_featured || false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при создании спектакля' });
  }
};

export const updatePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, description, short_description, history, duration, date, time, image_url, is_featured } = req.body;
    
    const result = await query(
      `UPDATE performances SET 
        title = $1, type = $2, description = $3, short_description = $4, 
        history = $5, duration = $6, date = $7, time = $8, image_url = $9, is_featured = $10,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 RETURNING *`,
      [title, type, description, short_description, history, duration, date, time, image_url, is_featured, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Спектакль не найден' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при обновлении спектакля' });
  }
};

export const deletePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    
    await query('DELETE FROM performance_cast WHERE performance_id = $1', [id]);
    const result = await query('DELETE FROM performances WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Спектакль не найден' });
    }
    
    res.json({ message: 'Спектакль удален' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при удалении спектакля' });
  }
};

// ========== АРТИСТЫ ==========
export const createArtist = async (req, res) => {
  try {
    const { first_name, last_name, role, category, biography, image_url } = req.body;
    
    const result = await query(
      `INSERT INTO artists (first_name, last_name, role, category, biography, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [first_name, last_name, role, category, biography, image_url]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при создании артиста' });
  }
};

export const updateArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, role, category, biography, image_url } = req.body;
    
    const result = await query(
      `UPDATE artists SET 
        first_name = $1, last_name = $2, role = $3, category = $4, biography = $5, image_url = $6,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [first_name, last_name, role, category, biography, image_url, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Артист не найден' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при обновлении артиста' });
  }
};

export const deleteArtist = async (req, res) => {
  try {
    const { id } = req.params;
    
    await query('DELETE FROM performance_cast WHERE artist_id = $1', [id]);
    await query('DELETE FROM favorite_artists WHERE artist_id = $1', [id]);
    const result = await query('DELETE FROM artists WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Артист не найден' });
    }
    
    res.json({ message: 'Артист удален' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при удалении артиста' });
  }
};
// ========== ВОПРОСЫ ТЕСТА ==========
export const getQuizQuestionsAdmin = async (req, res) => {
  try {
    const result = await query('SELECT * FROM quiz_questions ORDER BY created_at');
    
    const questions = [];
    for (const q of result.rows) {
      const options = await query(
        'SELECT id, option_text as text, option_value as value FROM quiz_options WHERE question_id = $1',
        [q.id]
      );
      questions.push({
        id: q.id,
        question: q.question,
        options: options.rows,
      });
    }
    
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении вопросов' });
  }
};

export const createQuizQuestion = async (req, res) => {
  try {
    const { question, options } = req.body;
    
    const result = await query(
      'INSERT INTO quiz_questions (question) VALUES ($1) RETURNING id',
      [question]
    );
    
    const questionId = result.rows[0].id;
    
    for (const opt of options) {
      await query(
        'INSERT INTO quiz_options (question_id, option_text, option_value) VALUES ($1, $2, $3)',
        [questionId, opt.text, opt.value]
      );
    }
    
    res.status(201).json({ id: questionId, question, options });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при создании вопроса' });
  }
};

export const updateQuizQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, options } = req.body;
    
    await query('UPDATE quiz_questions SET question = $1 WHERE id = $2', [question, id]);
    
    await query('DELETE FROM quiz_options WHERE question_id = $1', [id]);
    
    for (const opt of options) {
      await query(
        'INSERT INTO quiz_options (question_id, option_text, option_value) VALUES ($1, $2, $3)',
        [id, opt.text, opt.value]
      );
    }
    
    res.json({ id, question, options });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при обновлении вопроса' });
  }
};

export const deleteQuizQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    await query('DELETE FROM quiz_options WHERE question_id = $1', [id]);
    await query('DELETE FROM quiz_questions WHERE id = $1', [id]);
    
    res.json({ message: 'Вопрос удален' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при удалении вопроса' });
  }
};

// ========== БИНГО ==========
export const getBingoSquaresAdmin = async (req, res) => {
  try {
    // Получаем квадраты из настроек (можно хранить в отдельной таблице)
    const result = await query('SELECT * FROM bingo_squares_settings ORDER BY position');
    
    if (result.rows.length === 0) {
      // Дефолтные квадраты
      const defaultSquares = [
        'Увидел(а) овации', 'Услышал(а) "Браво!"', 'Увидел(а) дирижера', 'Стал(а) свидетелем пируэта',
        'Услышал(а) арию', 'Человек с биноклем', 'Аплодировал(а)', 'Насладился(ась) оркестром',
        'FREE', 'Увидел(а) костюм с перьями', 'Услышал(а) дуэт', 'Увидел(а) гранд жэтэ',
        'Восхитился(ась) декорациями', 'Увидел(а) любимого артиста', 'Взял(а) программу', 'Досмотрел(а) до конца'
      ];
      return res.json(defaultSquares);
    }
    
    const squares = result.rows.sort((a, b) => a.position - b.position).map(r => r.text);
    res.json(squares);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении квадратов бинго' });
  }
};

export const updateBingoSquares = async (req, res) => {
  try {
    const { squares } = req.body;
    
    // Очищаем старые записи
    await query('DELETE FROM bingo_squares_settings');
    
    // Вставляем новые
    for (let i = 0; i < squares.length; i++) {
      await query(
        'INSERT INTO bingo_squares_settings (position, text) VALUES ($1, $2)',
        [i, squares[i]]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при обновлении квадратов бинго' });
  }
};
// ========== СЛОВАРЬ ==========
export const createGlossaryTerm = async (req, res) => {
  try {
    const { term, definition } = req.body;
    
    const result = await query(
      'INSERT INTO glossary_terms (term, definition) VALUES ($1, $2) RETURNING *',
      [term, definition]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при создании термина' });
  }
};

export const updateGlossaryTerm = async (req, res) => {
  try {
    const { id } = req.params;
    const { term, definition } = req.body;
    
    const result = await query(
      'UPDATE glossary_terms SET term = $1, definition = $2 WHERE id = $3 RETURNING *',
      [term, definition, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Термин не найден' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при обновлении термина' });
  }
};

export const deleteGlossaryTerm = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM glossary_terms WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Термин не найден' });
    }
    
    res.json({ message: 'Термин удален' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при удалении термина' });
  }
};

// ========== БАЛЕТНЫЕ ЭЛЕМЕНТЫ ==========
export const createBalletElement = async (req, res) => {
  try {
    const { name, description, image_url } = req.body;
    
    const result = await query(
      'INSERT INTO ballet_elements (name, description, image_url) VALUES ($1, $2, $3) RETURNING *',
      [name, description, image_url]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при создании элемента' });
  }
};

export const updateBalletElement = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url } = req.body;
    
    const result = await query(
      'UPDATE ballet_elements SET name = $1, description = $2, image_url = $3 WHERE id = $4 RETURNING *',
      [name, description, image_url, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Элемент не найден' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при обновлении элемента' });
  }
};

export const deleteBalletElement = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM ballet_elements WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Элемент не найден' });
    }
    
    res.json({ message: 'Элемент удален' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при удалении элемента' });
  }
};

// ========== ЗАГРУЗКА ИЗОБРАЖЕНИЙ ==========
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }
    
    // Сохраняем информацию о загрузке в БД
    const result = await query(
      `INSERT INTO uploads (filename, original_name, url, mime_type, size, uploaded_by) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, url`,
      [req.file.filename, req.file.originalname, `/uploads/${req.file.filename}`, req.file.mimetype, req.file.size, req.userId]
    );
    
    res.json({ url: result.rows[0].url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при загрузке изображения' });
  }
};