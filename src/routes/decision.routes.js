const express = require('express')
  , controller = require('../controllers/decision.controller')
  , router = express.Router()

router.post('/', controller.addPost)

module.exports = router
