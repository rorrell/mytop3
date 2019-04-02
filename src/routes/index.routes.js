const express = require('express')
  , controller = require('../controllers/index.controller')
  , router = express.Router()

// Index Route
router.get('/', controller.index)

// About Route
router.get('/about', controller.about)

module.exports = router