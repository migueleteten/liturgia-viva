const express = require('express');
const { getCapitulo } = require('../controllers/bibliaController');
const router = express.Router();

router.get('/:libro/:capitulo', getCapitulo);

module.exports = router;