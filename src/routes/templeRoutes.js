const express = require('express');
const router = express.Router();
const { searchTemplos } = require('../controllers/templeController');
const { searchCodigosPostales } = require('../controllers/templeController');

// Ruta para buscar templos por código postal
router.get('/search', searchTemplos);

// Ruta para buscar códigos postales similares
router.get('/codigosPostales', searchCodigosPostales);

module.exports = router;
