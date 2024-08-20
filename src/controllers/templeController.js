const db = require('../config/dbConfig');

const searchTemplos = async (req, res) => {
  const { nombre, codigoPostal } = req.query;
  console.log('Buscando templos con código postal: ' + codigoPostal + ' y nombre: ' + nombre);

  try {
      const result = await db.query(
          `SELECT id, nombre, direccion 
           FROM templos 
           WHERE codigo_postal = $1 
           AND nombre ILIKE $2 
           AND usuario_id IS NULL`,
          [codigoPostal, `%${nombre}%`]
      );
      res.status(200).json({ templos: result.rows });
  } catch (error) {
      res.status(500).json({ error: 'Error al buscar los templos: ' + error.message });
  }
};

// Función para buscar códigos postales
const searchCodigosPostales = async (req, res) => {
  const { codigoPostal } = req.query;
  console.log('Buscando códigos postales similares a ' + codigoPostal);

  try {
      const result = await db.query(
          `SELECT DISTINCT codigo_postal FROM templos WHERE codigo_postal LIKE $1 LIMIT 10`,
          [`${codigoPostal}%`]
      );
      res.status(200).json({ codigosPostales: result.rows });
  } catch (error) {
      res.status(500).json({ error: 'Error al buscar códigos postales: ' + error.message });
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
  updateParroquia,
  searchTemplos,
  searchCodigosPostales
};
