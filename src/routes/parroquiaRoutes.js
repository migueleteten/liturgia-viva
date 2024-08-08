const express = require('express');
const { createParroquia, updateParroquia } = require('../controllers/parroquiaController');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware'); // Middleware para autenticar el token JWT

router.post('/createParroquia', authenticateToken, createParroquia);
router.put('/updateParroquia/:id', authenticateToken, updateParroquia);

module.exports = router;
