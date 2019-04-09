const chai = require('chai')
  , componentUnderTest = require('../../src/helpers/validation.helper')
  , sinon = require('sinon')
  , moment = require('moment')

let expect = chai.expect

afterEach(() => {
  sinon.reset()
})

describe('validateTask method', () => {
  it('Returns an array', () => {
    let result = componentUnderTest.validateTask({})
    expect(result).to.be.an('array')
  })
  it('Ensures there\'s a description', () => {
    let task = {
      name: 'Test'
    }
    let errors = componentUnderTest.validateTask(task)
    expect(errors).to.be.an('array').that.deep.includes({ text: 'Please enter the description for this task' })
  })
  it('Ensures the priority is a number', () => {
    let task = {
      description: 'Hello',
      priority: 'x'
    }
    let errors = componentUnderTest.validateTask(task)
    expect(errors).to.be.an('array').that.deep.includes({ text: 'Priority must be a number' })
  })
  it('Ensures that as long as the priority is a number, it is a non-negative one', () => {
    let task = {
      description: 'Hello',
      priority: -3
    }
    let errors = componentUnderTest.validateTask(task)
    expect(errors).to.be.an('array').that.deep.includes({ text: 'Priority must be at least 0' })

    task.priority = 0 //zero is acceptable
    errors = componentUnderTest.validateTask(task)
    expect(errors).to.be.an('array').that.is.empty
  })
  it('Ensure that the due date is not in the past', () => {
    let task = {
      description: 'Walkashame',
      priority: 0,
      dueDate: moment().add(-1, 'days')
    }
    let errors = componentUnderTest.validateTask(task)
    expect(errors).to.be.an('array').that.deep.includes({ text: 'Due date cannot be in the past' })
  })
})

describe('checkForIdParam method', () => {
  it('Returns the same type as the return type of next if params is invalid', () => {
    let nextData = [
      function() { },
      function() {() => null},
      function() {() => 1}
    ]
    let params = {}
    for (let i = 0; i < nextData.length; i++) {
      let result = componentUnderTest.checkForIdParam(params, nextData[i])
      expect(typeof(result)).to.equal(typeof (nextData[i]()))
    }
  })
  it('Returns nothing if params is valid', () => {
    let nextData = [
      function () { },
      function () { () => null },
      function () { () => 1 }
    ]
    let params = { id: 1 }
    for (let i = 0; i < nextData.length; i++) {
      let result = componentUnderTest.checkForIdParam(params, nextData[i])
      expect(result).to.be.undefined
    }
  })
  it('Calls next with an error if it is called with an invalid object', () => {
    var next = sinon.spy()
    componentUnderTest.checkForIdParam({}, next)
    expect(next.calledOnce).to.be.true
    expect(next.args[0][0]).to.be.an('Error').with.property('message').that.equals('No id specified in the URL')
  })
  it('Does not call next if it is called with a valid object', () => {
    var next = function () { }
    let spy = sinon.spy(next)
    componentUnderTest.checkForIdParam({ id: 1 }, next)
    expect(spy.callCount).to.equal(0)
  })
  it('What happens when no next sent?', () => {
    let func = () => componentUnderTest.checkForIdParam({})
    expect(func).to.throw('next is not a function')
  })
})