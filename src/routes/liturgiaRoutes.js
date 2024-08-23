const express = require('express');
const { getLiturgiasForDate } = require('../controllers/liturgiaController');
const router = express.Router();

router.get('/liturgias/:date', getLiturgiasForDate);

module.exports = router;