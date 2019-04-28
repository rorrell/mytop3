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
  mockgoose.helper.reset().then(() => {
    done()
  }).catch(err => {
    done(err)
  })
})
after((done) => {
  /* shutdown method is BUNK - throws an error internally that isn't caught and can't be caught at this level.  But at least it exits the testing at all when Ctrl+C doesn't always work either. */
  try {
    mockgoose.shutdown()
      .then((num) => {
        done()
      }).catch(done)
  } catch(err) {
    done(err)
  }
  done()
})