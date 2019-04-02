const mongoose = require('mongoose')
  , Mockgoose = require('mockgoose').Mockgoose
  , mongooseHelper = require('../src/helpers/mongoose.helper')

var mockgoose = new Mockgoose(mongoose)

before((done) => {
  connection = mockgoose.prepareStorage().then(function () {
    mongooseHelper.connectToMongoose().then(() => {
      done()
    }).catch(done)
  })
})
beforeEach((done) => {
  mockgoose.helper.reset().then(() => done()).catch(done)
})
after((done) => {
  mockgoose.shutdown().then(() => {
    done()
  }).catch(done)
})