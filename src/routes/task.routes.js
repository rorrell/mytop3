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

router.route('/complete/:id')
  .put(controller.toggleComplete)

router.route('/tags/:tag')
  .get(controller.searchTags)

router.route('/batch/postpone')
  .post(controller.postponeOverdue)

router.route('/batch/completed')
  .delete(controller.removedCompleted)

router.route('/batch/pick')
  .get(controller.pick)

module.exports = router