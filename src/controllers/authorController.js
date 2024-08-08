const db = require('../config/dbConfig');

const getAuthors = async (req, res) => {
  const { query } = req.query;
  try {
    const result = await db.query('SELECT nombre FROM autores WHERE nombre ILIKE $1', [`%${query}%`]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAuthor = async (req, res) => {
  const { nombre } = req.body;
  try {
    const result = await db.query('INSERT INTO autores (nombre) VALUES ($1) RETURNING *', [nombre]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAuthors,
  createAuthor
};
