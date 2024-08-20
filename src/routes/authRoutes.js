const express = require('express');
const { registerParroquiaAdministrador, registerFeligres, login, createParroquiaUser, verifyEmail } = require('../controllers/authController');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware'); // Middleware para autenticar el token JWT

router.post('/register/parroquia_administrador', registerParroquiaAdministrador);
router.post('/register/feligres', registerFeligres);
router.post('/login', login);
router.post('/createParroquiaUser', authenticateToken, createParroquiaUser);
router.get('/verify-email', verifyEmail);

module.exports = router;
