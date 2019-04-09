const service = require('../services/task.service')
  , validator = require('../helpers/validation.helper')

module.exports = {
  index: (req, res, next) => {
    service.getAllTasks('priority')
      .then(tasks => {
        res.render('tasks/index', {
          title: 'Tasks',
          tasks: tasks
        })
      }).catch(next)
  },
  add: (req, res, next) => {
    res.render('tasks/add', {
      title: service.addTitle
    })
  },
  addPost: (req, res, next) => {
    service.addTask(req.body)
      .then(result => {
        if (result.errors.length > 0) {
          res.render('tasks/add', {
            title: service.addTitle,
            errors: result.errors,
            task: result.task
          })
        } else {
          req.flash('success_msg', `Task saved`)
          res.redirect(`/tasks`)
        }
      }).catch(next)
  },
  edit: (req, res, next) => {
    validator.checkForIdParam(req.params, next)
    service.getTaskById(req.params.id)
      .then(task => {
        res.render(`tasks/edit`, {
          title: service.editTitle,
          task: task
        })
      }).catch(next)
  },
  editPost: (req, res, next) => {
    validator.checkForIdParam(req.params, next)
    service.editTask(req.params.id, req.body)
      .then(result => {
        if (result.errors.length > 0) {
          res.render(`tasks/edit`, {
            title: service.editTitle,
            task: result.task,
            errors: result.errors
          })
        } else {
          req.flash('success_msg', 'Task updated')
          res.redirect('/tasks')
        }
      }).catch(next)
  },
  show: (req, res, next) => {
    validator.checkForIdParam(req.params, next)
    service.getTaskById(req.params.id)
      .then(task => {
        res.render('tasks/show', {
          title: task.description,
          task: task
        })
      }).catch(next)
  },
  delete: (req, res, next) => {
    validator.checkForIdParam(req.params, next)
    service.deleteTask(req.params.id)
      .then(() => {
        req.flash('success_msg', 'Task successfully deleted')
        res.redirect('/tasks')
      }).catch(next)
  },
  toggleComplete: (req, res, next) => {
    validator.checkForIdParam(req.params, next)
    service.toggleComplete(req.params.id)
      .then(task => {
        req.flash('success_msg', 'Task updated')
        res.redirect('/tasks')
      }).catch(next)
  }
}