const chai = require('chai')
  componentUnderTest = require('../../src/models/Decision.model')
  , Task = require('../../src/models/Task.model')
  , utils = require('../testUtility')
  , chaiDatetime = require('chai-datetime')
  , moment = require('moment')

chai.use(chaiDatetime)
let expect = chai.expect

describe('the decision model', () => {
  it('Defaults the date to now', (done) => {
    let task = new Task({ description: 'Figure1' })
    new componentUnderTest({ top3s: [task]})
      .save()
      .then(decision => {
        utils.validateDefaultsToNow(decision.date)
        done()
      }).catch(done)
  })
})