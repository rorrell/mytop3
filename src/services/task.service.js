const Task = require('../models/Task.model')
  , validator = require('../helpers/validation.helper')
  , moment = require('moment')

function taskFromRequestBody(body) {
  let getFromInput = (property, alternate) => {
    if(property === '' && alternate !== '') return undefined
    if (!alternate) return property
    return alternate
  }
  return {
    description: body.description,
    priority: getFromInput(body.priority),
    dueDate: getFromInput(body.dueDate),
    tags: getFromInput(body.tagList, body.tagList.split(', ')),
    difficulty: getFromInput(body.difficulty),
    location: getFromInput(body.location, ''),
    notes: getFromInput(body.notes, ''),
    repeatInterval: body.repeatType !== '' && Number(body.repeatAmt) > 0 ? moment.duration(Number(body.repeatAmt), body.repeatType).toISOString() : ''
  }
}

var addTask = (reqBody) => {
  return new Promise((resolve, reject) => {
    let errors = validator.validateTask(reqBody)
    if (errors.length > 0) {
      resolve({ errors: errors, task: null })
    } else {
      new Task(taskFromRequestBody(reqBody))
        .save()
        .then(task => {
          resolve({ errors: [], task: task })
        }).catch(reject)
    }
  })
}

module.exports = {
  addTitle: 'Add New Task',
  editTitle: 'Edit Task',
  taskFromRequestBody: taskFromRequestBody,
  getAllTasks: (sort) => {
    return Task.find().sort(sort)
  },
  getIncompleteTasks: (sort) => {
    return Task.find().byComplete(false).sort(sort)
  },
  addTask: addTask,
  editTask: (taskId, reqBody) => {
    return new Promise((resolve, reject) => {
      let errors = validator.validateTask(reqBody)
      let taskToEdit = taskFromRequestBody(reqBody)
      taskToEdit.id = taskId
      if(errors.length > 0) {
        resolve({ errors: errors, task: taskToEdit })
      } else {
        Task.findById(taskId)
        .then(task => {
          return Task.findByIdAndUpdate(taskId, taskToEdit, { new: true }) //just so we can get back the updated doc
        }).then(task => {
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
          let nextStep;
          if (task.isComplete && task.repeatInterval) { //a repeating task that we are about to mark as complete
            let newTask = new Task(task)
            newTask.isComplete = false
            newTask.dueDate = moment().add(moment.duration(newTask.repeatInterval).asMilliseconds(), 'milliseconds').toDate()
            nextStep = newTask.save()
          } else { resolve(task) }
          return nextStep
        }).then(task => {
          resolve(task)
        }).catch(reject)
    })
  },
  findByTag: (tag) => {
    return new Promise((resolve, reject) => {
      if(!tag) {
        reject(new Error('Expected tag parameter'))
      }
      Task.find().byTag(tag)
        .then(tasks => {
          resolve(tasks)
        }).catch(reject)
    })
  },
  postponeAllOverdue: () => {
      return new Promise((resolve, reject) => {
        Task.find().byOverdue().updateMany({ $set: { dueDate: moment().endOf('day') } })
          .then((result) => {
            resolve(result.nModified)
          }).catch(reject)
      })
  },
  removeAllCompleted: () => {
    return new Promise((resolve, reject) => {
      Task.find().byComplete(true).deleteMany({})
        .then(() => resolve())
        .catch(reject)
    })
  }
}