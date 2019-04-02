const mongoose = require('mongoose')

const Schema = mongoose.Schema

var getEndOfDay = () => {
  let today = new Date()
  today.setHours(23, 59, 59, 0)
  return today
}

// Create Schema
const TaskSchema = new Schema({
  description: {
    type: String,
    required: true
  },
  priority: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: new Date()
  },
  dueDate: {
    type: Date,
    default: getEndOfDay()
  },
  tags: [{
    name: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: new Date()
    }
  }]
  // user: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'users'
  // }
})

TaskSchema.virtual('tagList')
  .get(function() {
    if(!this.tags) {
      return ''
    }
    return this.tags.map(tag => tag.name).join(', ')
  })
  .set(function(v) {
    this.tags = v && v !== '' ? v.split(', ').map((item) => { return {name: item} }) : null
  })

module.exports = mongoose.model('tasks', TaskSchema)