const db = require('../config/dbConfig');

const createParroquia = async (req, res) => {
  const { nombre, direccion, horarios } = req.body;
  const { userId, rolId } = req.user; // Obtener datos del token JWT

  if (rolId !== 2) { // Verificar que el rol del usuario sea "parroquia_administrador"
    return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
  }

  try {
    const result = await db.query(
      'INSERT INTO parroquias (nombre, direccion, horarios, administrador_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, direccion, horarios, userId]
    );

    const parroquia = result.rows[0];
    res.status(201).json({ parroquia });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateParroquia = async (req, res) => {
  const { nombre, direccion, horarios } = req.body;
  const { userId, rolId } = req.user;
  const parroquiaId = req.params.id;

  if (rolId !== 2) { // Verificar que el rol del usuario sea "parroquia_administrador"
    return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
  }

  try {
    const result = await db.query(
      'UPDATE parroquias SET nombre = $1, direccion = $2, horarios = $3 WHERE id = $4 AND administrador_id = $5 RETURNING *',
      [nombre, direccion, horarios, parroquiaId, userId]
    );

    const parroquia = result.rows[0];
    res.status(200).json({ parroquia });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createParroquia,
  updateParroquia
};
