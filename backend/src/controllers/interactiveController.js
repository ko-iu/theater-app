import { query } from '../config/database.js';

export const getQuizQuestions = async (req, res) => {
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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const submitQuizResult = async (req, res) => {
  try {
    const { answers, recommendedPerformanceId } = req.body;
    const userId = req.userId;
    
    const result = await query(
      'INSERT INTO quiz_results (user_id, result_performance_id, answers) VALUES ($1, $2, $3) RETURNING id',
      [userId, recommendedPerformanceId, JSON.stringify(answers)]
    );
    
    res.json({ success: true, resultId: result.rows[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBingoSquares = async (req, res) => {
  // Default bingo squares
  const defaultSquares = [
    'Увидел(а) овации', 'Услышал(а) "Браво!"', 'Увидел(а) дирижера', 'Стал(а) свидетелем пируэта',
    'Услышал(а) арию', 'Человек с биноклем', 'Аплодировала', 'Насладилась оркестром',
    'FREE', 'Увидел(а) костюм с перьями', 'Услышал(а) дуэт', 'Увидел(а) гранд жэтэ',
    'Восхитился(ась) декорациями', 'Увидел(а) любимого артиста', 'Взял(а) программу', 'Досмотрел(а) до конца'
  ];
  
  res.json(defaultSquares);
};

export const saveBingoCard = async (req, res) => {
  try {
    const { squares, completedSquares } = req.body;
    const userId = req.userId;
    
    const result = await query(
      `INSERT INTO bingo_cards (user_id, squares, completed_squares, is_completed)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [userId, JSON.stringify(squares), JSON.stringify(completedSquares || []), false]
    );
    
    res.json({ success: true, cardId: result.rows[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};