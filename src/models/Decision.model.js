const mongoose = require('mongoose')

const Schema = mongoose.Schema

// Create Schema
const DecisionSchema = new Schema({
  top3s: [{
    task: {
      type: Schema.Types.ObjectId,
      ref: 'tasks'
    }
  }],
  others: [{
    task: {
      type: Schema.Types.ObjectId,
      ref: 'tasks'
    }
  }],
  date: {
    type: Date,
    default: new Date()
  }
})

module.exports = mongoose.model('decisions', DecisionSchema)
