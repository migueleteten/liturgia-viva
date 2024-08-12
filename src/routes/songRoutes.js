const express = require('express');
const {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
  convertSong,
  suggestTags,
  searchAutores,
  searchEtiquetas
} = require('../controllers/songController');
const router = express.Router();

router.get('/', getAllSongs); // Obtener todas las canciones
router.get('/:id', getSongById); // Obtener una canción por ID
router.post('/', createSong); // Crear una nueva canción
router.put('/:id', updateSong); // Actualizar una canción existente
router.delete('/:id', deleteSong); // Eliminar una canción
router.post('/convert', convertSong); // Convertir texto de canción a estructura
router.post('/suggest-tags', suggestTags); // Sugerir etiquetas para una canción
// Rutas para sugerencias de autores y etiquetas
router.get('/autores/search', searchAutores);
router.get('/etiquetas/search', searchEtiquetas);

module.exports = router;
