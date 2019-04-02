const mongoose = require('mongoose')
  , keys = require('../config/keys/keys')

module.exports = {
  connectToMongoose: () => {
    return new Promise((resolve, reject) => {
      mongoose.connect(keys.mongoURI, {
        useNewUrlParser: true,
        useFindAndModify: false
      }).then(() => {
        resolve(mongoose.connection)
      }).catch(reject)
    })
  },
  closeConnection: function() {
    mongoose.connection.close(err => {
      if(err) {
        console.log(err)
      }
    })
  }
}