import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

const router = express.Router();

// Регистрация (email основной, телефон дополнительный)
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    // Проверка обязательных полей
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Заполните все обязательные поля' });
    }
    
    // Проверка формата email
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Введите корректный email' });
    }
    
    // Проверка формата телефона (если указан)
    if (phone) {
      const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: 'Введите корректный номер телефона' });
      }
    }
    
    // Проверяем, существует ли пользователь с таким email
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Пользователь с таким email уже зарегистрирован' });
    }
    
    // Проверяем телефон на уникальность (если указан)
    if (phone) {
      const existingPhone = await query('SELECT id FROM users WHERE phone = $1', [phone]);
      if (existingPhone.rows.length > 0) {
        return res.status(400).json({ message: 'Пользователь с таким телефоном уже зарегистрирован' });
      }
    }
    
    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Создаем пользователя
    const result = await query(
      `INSERT INTO users (email, phone, password_hash, first_name, last_name, name, role) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, phone, first_name, last_name, name, role`,
      [email, phone || null, hashedPassword, firstName, lastName, `${firstName} ${lastName}`, 'user']
    );
    
    const user = result.rows[0];
    
    // Создаем JWT токен
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Вход по email
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Введите email и пароль' });
    }
    
    const result = await query(
      'SELECT id, email, phone, first_name, last_name, name, password_hash, role FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }
    
    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

export default router;