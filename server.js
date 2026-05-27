import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

import authRoutes from './src/routes/authRoutes.js';
import performanceRoutes from './src/routes/performanceRoutes.js';
import artistRoutes from './src/routes/artistRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import favoriteRoutes from './src/routes/favoriteRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import glossaryRoutes from './src/routes/glossaryRoutes.js';
import balletRoutes from './src/routes/balletRoutes.js';
import interactiveRoutes from './src/routes/interactiveRoutes.js';

import { authMiddleware } from './src/middleware/auth.js';
import { adminMiddleware } from './src/middleware/admin.js';
import { uploadImage } from './src/controllers/adminController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Multer настройка
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Только изображения!'));
  }
});

// Middleware
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Публичные маршруты
app.use('/api/auth', authRoutes);
app.use('/api/performances', performanceRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/glossary', glossaryRoutes);
app.use('/api/ballet', balletRoutes);
app.use('/api/interactive', interactiveRoutes);

// Защищенные маршруты
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/favorites', authMiddleware, favoriteRoutes);

// Админ-маршруты
app.use('/api/admin', authMiddleware, adminMiddleware, adminRoutes);
app.post('/api/upload', authMiddleware, adminMiddleware, upload.single('image'), uploadImage);

// Тестовый маршрут
app.get('/api/test', (req, res) => {
  res.json({ message: 'Сервер работает!' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message === 'Только изображения!') {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Что-то пошло не так!' });
});
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});