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
    return errors
  },
  checkForIdParam: (params, next) => {
    if (!params || !params.id) {
      return next(new Error('No id specified in the URL'))
    }
  },
  varIsDefinedStringAndNotEmpty: (arg) => {
    return arg && arg !== ''
  }
} 