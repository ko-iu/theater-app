import bcrypt from 'bcryptjs';

const password = 'admin123';
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);
console.log('Хеш для пароля "admin123":', hash);