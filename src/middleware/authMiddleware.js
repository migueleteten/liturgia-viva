const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acceso denegado' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    console.log('Authenticated User:', req.user); // Agregar esto para depurar
    next();
  } catch (err) {
    res.status(400).json({ error: 'Token no válido' });
  }
};

module.exports = { authenticateToken };
