require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/dbConfig');

const registerParroquiaAdministrador = async (req, res) => {
  const { email, password } = req.body;
  const roleId = 2; // ID del rol "parroquia_administrador"
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO usuarios (email, password, rol_id) VALUES ($1, $2, $3) RETURNING *',
      [email, hashedPassword, roleId]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, rolId: user.rol_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, userId: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const registerFeligres = async (req, res) => {
  const { email, password } = req.body;
  const roleId = 4; // ID del rol "feligres"
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO usuarios (email, password, rol_id) VALUES ($1, $2, $3) RETURNING *',
      [email, hashedPassword, roleId]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, rolId: user.rol_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, userId: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt with email:', email); // Depurar
  
  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = result.rows[0];

    console.log('User found:', user); // Depurar

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch); // Depurar

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, rolId: user.rol_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token, userId: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createParroquiaUser = async (req, res) => {
  const { email, password, role } = req.body;
  const { userId, rolId } = req.user;

  if (rolId !== 2) { // Verificar que el rol del usuario sea "parroquia_administrador"
    return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO usuarios (email, password, rol_id, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, hashedPassword, role, userId]
    );

    const user = result.rows[0];
    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  registerParroquiaAdministrador,
  registerFeligres,
  login,
  createParroquiaUser
};
