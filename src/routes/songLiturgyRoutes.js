const express = require('express');
const {
  getSongsBySectionAndTags,
  getRandomSongBySection
} = require('../controllers/songLiturgyController');
const router = express.Router();

router.get('/canciones', getSongsBySectionAndTags);
router.get('/canciones/random', getRandomSongBySection);

module.exports = router;