const service = require('../services/task.service')
  , validator = require('../helpers/validation.helper')

module.exports = {
  index: (req, res, next) => {
    service.getAllTasks([['isComplete', 1], ['dueDate', 1], ['priority', 1]])
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
          title: '',
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
  },
  searchTags: (req, res, next) => {
    if(!req.params.tag) {
      return next(new Error('No tag specified in the URL'))
    }
    service.findByTag(req.params.tag)
      .then(tasks => {
        res.render('tasks/index', {
          title: `Tag: ${req.params.tag}`,
          tasks: tasks
        })
      }).catch(next)
  },
  postponeOverdue: (req, res, next) => {
    service.postponeAllOverdue()
      .then(nModified => {
        req.flash('success_msg', 'Overdue tasks successfully postponed')
        res.redirect('/tasks')
      }).catch(next)
  },
  removedCompleted: (req, res, next) => {
    service.removeAllCompleted()
      .then(() => {
        req.flash('success_msg', 'Completed tasks successfully removed')
        res.redirect('/tasks')
      }).catch(next)
  },
  pick: (req, res, next) => {
    service.getIncompleteTasks([['dueDate', 1], ['priority', 1]])
      .then(tasks => {
        res.render('tasks/pick', {
          title: 'Pick Next 3 Tasks',
          tasks: tasks
        })
      }).catch(next)
  },
}