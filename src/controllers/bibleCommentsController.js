const db = require('../config/dbConfig');
const jwt = require('jsonwebtoken');

// Guardar comentario
const saveComment = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('Usuario ID: ' + decoded.userId);
    
    const { libro, capitulo, versiculo, comentario } = req.body;

    console.log('Libro ID: ' + libro);
    console.log('Capítulo: ' + capitulo);
    console.log('Versículo: ' + versiculo);
    console.log('Comentario: ' + comentario);

    try {
        const result = await db.query(
            'INSERT INTO comentarios (usuario, libro_id, capitulo, versiculo, comentario) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [decoded.userId, libro, capitulo, versiculo, comentario]
        );
        res.status(201).json({ message: 'Comentario guardado con éxito', comentario: result.rows[0]});
    } catch (err) {
        res.status(500).json({ error: 'Error al guardar el comentario: ' + err.message });
    }
};

const getUserCommentsForVerse = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { versiculo } = req.params;
    const { libro, capitulo } = req.query;

    try {
        const result = await db.query(
            `SELECT * FROM comentarios WHERE
                usuario = $1 AND
                versiculo = $2 AND
                libro_id = $3 AND
                capitulo = $4`,
             [decoded.userId, versiculo, libro, capitulo]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los comentarios' });
    }
};

const getUserComments = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { libro, capitulo } = req.query;

    try {
        const result = await db.query(
            `SELECT * FROM comentarios WHERE usuario = $1 AND libro_id = $2 AND capitulo = $3`,
            [decoded.userId, libro, capitulo]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los comentarios' });
    }
};

module.exports = { saveComment, getUserCommentsForVerse, getUserComments };