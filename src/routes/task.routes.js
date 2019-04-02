const express = require('express')
  , controller = require('../controllers/task.controller')
  , router = express.Router()

router.route('/')
  .get(controller.index)
  .post(controller.addPost)

router.route('/add')
  .get(controller.add)

router.route('/edit/:id')
  .get(controller.edit)

router.route('/:id')
  .get(controller.show)
  .put(controller.editPost)
  .delete(controller.delete)

module.exports = router