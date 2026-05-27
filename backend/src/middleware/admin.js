export const adminMiddleware = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора.' });
  }
  next();
};