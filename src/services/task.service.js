const Task = require('../models/Task.model')
  , validator = require('../helpers/validation.helper')

function taskFromRequestBody(body) {
  return {
    description: body.description,
    priority: body.priority === '' ? undefined : body.priority,
    dueDate: body.dueDate === '' ? undefined : body.dueDate,
    tagList: body.tagList === '' ? undefined : body.tagList
  }
}

module.exports = {
  addTitle: 'Add New Task',
  editTitle: 'Edit Task',
  taskFromRequestBody: taskFromRequestBody,
  getAllTasks: (sort) => {
    return Task.find().sort(sort)
  },
  addTask: (reqBody) => {
    return new Promise((resolve, reject) => {
      let errors = validator.validateTask(reqBody)
      if(errors.length > 0) {
        resolve({errors: errors, task:null})
      } else {
        new Task(taskFromRequestBody(reqBody))
          .save()
          .then(task => {
            resolve({errors: [], task: task})
          }).catch(reject)
      }
    })
  },
  editTask: (taskId, reqBody) => {
    return new Promise((resolve, reject) => {
      let errors = validator.validateTask(reqBody)
      let taskToEdit = taskFromRequestBody(reqBody)
      taskToEdit.id = taskId
      if(errors.length > 0) {
        resolve({ errors: errors, task: taskToEdit })
      } else {
        //because we have a virtual, have to find first so we can set it manually
        Task.findById(taskId)
          .then(task => {
            task.tagList = taskToEdit.tagList //set virtual manually
            taskToEdit.tags = task.tags //turn it around
            return Task.findByIdAndUpdate(taskId, taskToEdit, { new: true }) //just so we can get back the updated doc
          })
          .then(task => {
            resolve({errors: [], task: task})
          }).catch(reject)
      }
    })
  },
  getTaskById: (id) => {
    return new Promise((resolve, reject) => {
      if (!id) { //because findById doesn't require this itself, strangely
        reject(new Error('Expected id parameter'))
      }
      Task.findById(id)
        .then((task) => {
          resolve(task)
        }).catch(reject)
    })
  },
  deleteTask: (id) => {
    return new Promise((resolve, reject) => {
      if (!id) { //because findByIdAndDelete doesn't require this itself, strangely
        reject(new Error('Expected id parameter'))
      }
      Task.findByIdAndDelete(id)
        .then(() => {
          resolve()
        }).catch(reject)
    })
  },
  toggleComplete: (id) => {
    return new Promise((resolve, reject) => {
      if (!id) { //because findById doesn't require this itself, strangely
        reject(new Error('Expected id parameter'))
      }
      Task.findById(id)
        .then((task) => {
          task.isComplete = !task.isComplete
          return Task.findByIdAndUpdate(task.id, task, { new: true }) //just so we can get back the updated doc
        }).then(task => {
          resolve(task)
        }).catch(reject)
    })
  }
}