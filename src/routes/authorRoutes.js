const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController');

router.get('/', authorController.getAuthors);
router.post('/', authorController.createAuthor);

module.exports = router;
