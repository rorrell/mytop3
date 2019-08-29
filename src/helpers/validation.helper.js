const moment = require('moment')

module.exports = {
  validateTask: (task) => {
    let errors = []
    if(!task.description) {
      errors.push({ text: 'Please enter the description for this task' })
    }
    if (task.priority) {
      if (isNaN(task.priority)) {
        errors.push({ text: 'Priority must be a number' })
      } else if(task.priority < 0) {
        errors.push({ text: 'Priority must be at least 0' })
      }
    }
    if(moment(task.dueDate).isBefore(moment())) {
      errors.push({ text: 'Due date cannot be in the past' })
    }
    return errors
  },
  checkForIdParam: (params, next) => {
    if (!params || !params.id) {
      return next(new Error('No id specified in the URL'))
    }
  },
  varIsDefinedStringAndNotEmpty: (arg) => {
    return arg && arg !== ''
  },
  validateDecision: (decision) => {
    let errors = []
    if(Array.isArray(decision.top3s) && Array.isArray(decision.others)) {
      let totalTasks = decision.top3s.length + decision.others.length;
      if(totalTasks == 0) {
        errors.push({ text: 'No tasks to save' })
      }
      else if (totalTasks <= 3 && decision.top3s.length < totalTasks) {
        errors.push({ text: 'You must pick all tasks if there are no more than three in total' })
      }
      else if (totalTasks > 3 && (decision.top3s.length < 3 || decision.top3s.length > 3)) {
        errors.push({ text: 'You must pick exactly three tasks' })
      }
    } else {
      errors.push({ text: 'Invalid arguments (must be arrays)' })
    }
    return errors
  }
} 