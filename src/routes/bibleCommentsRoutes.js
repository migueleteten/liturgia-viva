const express = require('express');
const router = express.Router();
const { saveComment } = require('../controllers/bibleCommentsController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/comentarios', authenticateToken, saveComment);

module.exports = router;