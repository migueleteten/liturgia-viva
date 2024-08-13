const db = require('../config/dbConfig');

// Guardar comentario
const saveComment = async (req, res) => {
    const { libro, capitulo, versiculo, comentario } = req.body;
    const usuarioId = req.user.userId; // Asegúrate de que el usuario esté autenticado

    try {
        const result = await db.query(
            'INSERT INTO comentarios (libro, capitulo, versiculo, comentario, usuario) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [libro, capitulo, versiculo, comentario, usuarioId]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { saveComment };