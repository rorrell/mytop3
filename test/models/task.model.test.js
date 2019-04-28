const chai = require('chai')
  componentUnderTest = require('../../src/models/Task.model')
  , utils = require('../testUtility')
  , chaiDatetime = require('chai-datetime')
  , moment = require('moment')

chai.use(chaiDatetime)
let expect = chai.expect

describe('the task model', () => {
  it('Requires the description', (done) => {
    new componentUnderTest({})
      .save()
      .then(task => {
        done(new Error('Save should fail with no description'))
      }).catch(err => {
        expect(err).to.not.be.undefined
        expect(err.message).to.contain('`description` is required.')
        done()
      })
  })
  it('Defaults dueDate to end of current day', (done) => {
    let endOfToday = moment().endOf('day').toDate()
    new componentUnderTest({description: 'Text'})
      .save()
      .then(task => {
        expect(task.dueDate).to.equalDate(endOfToday)
        expect(task.dueDate).to.equalTime(endOfToday)
        done()
      }).catch(done)
  })
  it('Defaults date to now', (done) => {
    new componentUnderTest({description: 'Speed'})
      .save()
      .then(task => {
        utils.validateDefaultsToNow(task.date)
        done()
      }).catch(done)
  })
  it('Defaults isComplete to false', (done) => {
    new componentUnderTest({description: 'CPA'})
      .save()
      .then(task => {
        expect(task.isComplete).to.be.false
        done()
      }).catch(done)
  })
  it('Defaults difficulty to zero', (done) => {
    new componentUnderTest({ description: 'Figure' })
      .save()
      .then(task => {
        expect(task.difficulty).to.equal(0)
        done()
      }).catch(done)
  })
  it('Defaults location to empty string', (done) => {
    new componentUnderTest({ description: 'Figure' })
      .save()
      .then(task => {
        expect(task.location).to.equal('')
        done()
      }).catch(done)
  })
  it('Defaults notes to empty string', (done) => {
    new componentUnderTest({ description: 'Figure' })
      .save()
      .then(task => {
        expect(task.notes).to.equal('')
        done()
      }).catch(done)
  })
})