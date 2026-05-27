import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

export const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Нет токена, доступ запрещен' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.id;
    
    // Получаем роль пользователя из БД
    const user = await query('SELECT role FROM users WHERE id = $1', [req.userId]);
    req.userRole = user.rows[0]?.role || 'user';
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Неверный токен' });
  }
};