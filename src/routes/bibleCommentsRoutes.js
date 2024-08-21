const express = require('express');
const router = express.Router();
const { saveComment, getUserCommentsForVerse, getUserComments } = require('../controllers/bibleCommentsController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/comentarios', authenticateToken, saveComment);
router.get('/comentarios/user/:versiculo', getUserCommentsForVerse);
router.get('/comentarios/user/', getUserComments);

module.exports = router;