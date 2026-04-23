const express = require('express');
const weatherRoutes = require('./weather');

const router = express.Router();

router.use('/weather', weatherRoutes);

module.exports = router;
