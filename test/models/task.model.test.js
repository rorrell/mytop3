const chai = require('chai')
  componentUnderTest = require('../../src/models/Task.model')
  , utils = require('../testUtility')
  , chaiDatetime = require('chai-datetime')

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
    let endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 0)
    new componentUnderTest({description: 'Text'})
      .save()
      .then(task => {
        expect(task.dueDate).to.equalDate(endOfToday)
        expect(task.dueDate.getTime()).to.equal(endOfToday.getTime())
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
  it('Saves tags using the virtual tagList with date defaulting to now', (done) => {
    new componentUnderTest({description: 'Doggo', tagList: 'Missy, King, Annabelle'})
      .save()
      .then(task => {
        expect(task.tags).to.be.an('array')
        expect(task.tags.map(t => t.name)).to.have.members(['Missy', 'King', 'Annabelle'])
        task.tags.forEach(tag => {
          expect(tag).to.have.property('date')
          utils.validateDefaultsToNow(tag.date)
          expect(tag).to.have.property('name')
          expect(tag).to.have.property('id')
        });
        done()
      }).catch(done)
  })
  it('Returns the tag names using the virtual tagList', (done) => {
    let task = {
      description: 'Kitty',
      tags: [
        { name: 'Jitterbug' },
        { name: 'Fuzzball' },
        { name: 'Pistorius' }
      ]
    }
    new componentUnderTest(task)
      .save()
      .then(newTask => {
        return componentUnderTest.findById(newTask.id)
      }).then(foundTask => {
        expect(foundTask.tagList).to.be.a('string').that.equals('Jitterbug, Fuzzball, Pistorius')
        done()
      }).catch(done)
  })
})