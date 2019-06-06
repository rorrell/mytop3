const mongoose = require('mongoose')
  , moment = require('moment')

const Schema = mongoose.Schema

// Create Schema
const TaskSchema = new Schema({
  description: {
    type: String,
    required: true
  },
  priority: {
    type: Number,
    default: 100
  },
  date: {
    type: Date,
    default: new Date()
  },
  dueDate: {
    type: Date,
    default: moment().endOf('day').toDate()
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  tags: [String],
  difficulty: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  repeatInterval: {
    type: String,
    default: ''
  }
  // user: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'users'
  // }
})

TaskSchema.query.byTag = function(tag) {
  return this.where({ tags: { $eq: tag } })
}

TaskSchema.query.byOverdue = function() {
  return this.where({ isComplete: { $eq: false }, dueDate: { $lt: Date.now() } })
}

TaskSchema.query.byComplete = function(isComplete) {
  return this.where({ isComplete: { $eq: isComplete }})
}

module.exports = mongoose.model('tasks', TaskSchema)