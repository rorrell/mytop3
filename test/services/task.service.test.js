const chai = require('chai')
  , chaiDatetime = require('chai-datetime')
  , chaiSorted = require('chai-sorted')
  , componentUnderTest = require('../../src/services/task.service')
  , Task = require('../../src/models/Task.model')
  , utils = require('../testUtility')
  , sinon = require('sinon')
  , validationHelper = require('../../src/helpers/validation.helper')
  , moment = require('moment')

chai.use(chaiDatetime)
chai.use(chaiSorted)
let expect = chai.expect

var buildTask = (description, priority, tags = null, dueDate = moment().add(1, 'minutes').toDate(), date = moment().toDate(), isComplete = false, difficulty = 0, location = '', notes = '') => {
  return {
    description: description,
    priority: priority,
    dueDate: dueDate,
    tags: tags != null ? tags : [],
    tagList: tags != null ? tags.join(', ') : '',
    date: date,
    isComplete: isComplete,
    difficulty: difficulty,
    location: location,
    notes: notes
  }
}

var validateTask = (expected, actual, includeIds = true) => {
  if (includeIds) {
    expect(actual.id).to.equal(expected.id)
  }
  expect(actual.description).to.equal(expected.description)
  expect(actual.priority).to.equal(expected.priority)
  expect(actual.dueDate).to.equalDate(expected.dueDate)
  expect(actual.dueDate.getTime()).to.equal(expected.dueDate.getTime())
  expect(actual.date).to.equalDate(expected.date)
  expect(actual.isComplete).to.equal(!expected.isComplete ? false : expected.isComplete)
  expect(actual.difficulty).to.equal(!expected.difficulty ? 0 : expected.difficulty)
  expect(actual.location).to.equal(!expected.location ? '' : expected.location)
  expect(actual.notes).to.equal(!expected.notes ? '' : expected.notes)
  if(!actual.tags) {
    expect(!expected.tags || expected.tags.length == 0).to.be.true
  } else {
    expect(actual.tags.length).to.equal(expected.tags.length)
    for (let i = 0; i < actual.tags.length; i++) {
      expect(actual.tags[i]).to.equal(expected.tags[i])
    }
  }
}

describe('The getAllTasks method of the task service', () => {
  it('Returns a promise', () => {
    utils.validateReturnsPromise(componentUnderTest.getAllTasks())
  })
  it('Then returns an empty array of tasks', (done) => {
    componentUnderTest.getAllTasks()
      .then(tasks => {
        expect(tasks).to.be.an('array').that.is.empty
        done()
      }).catch(done)
  })
  it('Returns a populated array of tasks if tasks are present', (done) => {
    var task = buildTask('I\'m a task', 3, ['cats'])
    new Task(task).save()
      .then(savedTask => {
        componentUnderTest.getAllTasks()
          .then(tasks => {
            expect(tasks).to.have.a.lengthOf(1)
            validateTask(savedTask, tasks[0])
            expect(tasks[0].tags).to.have.a.lengthOf(1)
            expect(savedTask.tags[0]).to.equal(tasks[0].tags[0])
            done()
          }).catch(done)
      }).catch(done)
  })
  it('Returns tasks sorted according to preference', (done) => {
    var now = new Date()
    var tomorrow = new Date(now.getFullYear(), now.getMonth(), 30)
    var inFiveDays = new Date(now.getFullYear(), now.getMonth(), 3)
    var inEightDays = new Date(now.getFullYear(), now.getMonth(), 12)
    var tasks = [
      new Task(buildTask('Wolf', 2, null, tomorrow)),
      new Task(buildTask('Hare', 1, null, inEightDays)),
      new Task(buildTask('Antelope', 3, null, inFiveDays))
    ]

    Task.create(tasks)
      .then((newTasks) => {
        return componentUnderTest.getAllTasks('description')
      })
      .then(byDescAsc => {
        expect(byDescAsc).to.be.ascendingBy('description')

        return componentUnderTest.getAllTasks('-description')
      })
      .then(byDescDesc => {
        expect(byDescDesc).to.be.descendingBy('description')
        
        return componentUnderTest.getAllTasks('priority')
      })
      .then(byPriorityAsc => {
        expect(byPriorityAsc).to.be.ascendingBy('priority')

        return componentUnderTest.getAllTasks('-priority')
      }).then(byPriorityDesc => {
        expect(byPriorityDesc).to.be.descendingBy('priority')

        return componentUnderTest.getAllTasks('dueDate')
      })
      .then(byDueDateAsc => {
        expect(byDueDateAsc).to.be.ascendingBy('dueDate')

        return componentUnderTest.getAllTasks('-dueDate')
      }).then(byDueDateDesc => {
        expect(byDueDateDesc).to.be.descendingBy('dueDate')
        done()
      })
      .catch(done)
  })
})

describe('The addTask method of the task service', () => {
  afterEach(() => {
    sinon.restore()
  })
  it('Returns a promise', () => {
    utils.validateReturnsPromise(componentUnderTest.addTask(buildTask('Test', 3)))
  })
  it('Then returns an object with errors and a task', (done) => {
    let task = buildTask('Ornithomimus', 100)
    componentUnderTest.addTask(task)
      .then(result => {
        expect(result).to.be.an('object')
        expect(result.errors).to.be.an('array').that.is.empty
        validateTask(task, result.task, false)
        done()
      })
      .catch(done)
  })
  it('Fails if you don\'t pass anything', (done) => {
    componentUnderTest.addTask()
      .then(() => {
        done(new Error('addTask should fail without arguments'))
      }).catch(err => {
        expect(err).not.to.be.undefined
        done()
      })
  })
  it('Fails if you pass null', (done) => {
    componentUnderTest.addTask(null)
      .then(() => {
        done(new Error('addTask should fail when passed null'))
      }).catch(err => {
        expect(err).not.to.be.undefined
        done()
      })
  })
  it('Validates invalid tasks', (done) => {
    let invalidTask = buildTask(undefined, 'x')
    let spy = sinon.spy(validationHelper, "validateTask")
    componentUnderTest.addTask(invalidTask)
      .then(result => {
        expect(spy.calledOnceWith(invalidTask)).to.be.true
        done()
      }).catch(done)
  })
  it('Validates valid tasks', (done) => {
    let validTask = buildTask('Supersonic', 2)
    let spy = sinon.spy(validationHelper, "validateTask")
    componentUnderTest.addTask(validTask)
      .then(result => {
        expect(spy.calledOnceWith(validTask)).to.be.true
        done()
      }).catch(done)
  })
})

describe('The editTask method of the task service', () => {
  var task
  beforeEach(done => {
    task = new Task(buildTask('T-Rex', 0))
    task.save()
      .then((newTask) => {
        task = newTask
        task.tagList = task.tags.join(', ')
        done()
      }).catch(done)
  })
  afterEach(() => {
    sinon.restore()
  })
  it('Returns a promise', () => {
    utils.validateReturnsPromise(componentUnderTest.editTask(task.id, task))
  })
  it('Then returns an object with errors and a modified task', (done) => {
    task.priority = 11
    componentUnderTest.editTask(task.id, task)
    .then(result => {
        expect(result).to.be.an('object')
        expect(result.errors).to.be.an('array').that.is.empty
        console.log(`Actual: ${result.task}`)
        validateTask(task, result.task)
        done()
      })
      .catch(done)
  })
  it('Fails if you don\'t pass anything', (done) => {
    componentUnderTest.editTask()
      .then(() => {
        done(new Error('editTask should fail without arguments'))
      }).catch(err => {
        expect(err).not.to.be.undefined
        done()
      })
  })
  it('Fails if you pass null', (done) => {
    componentUnderTest.editTask(null)
      .then(() => {
        done(new Error('editTask should fail when passed null'))
      }).catch(err => {
        expect(err).not.to.be.undefined
        done()
      })
  })
  it('Validates invalid tasks', (done) => {
    let invalidTask = buildTask(undefined, 'x')
    invalidTask.id = task.id
    let spy = sinon.spy(validationHelper, "validateTask")
    componentUnderTest.editTask(invalidTask.id, invalidTask)
      .then(result => {
        expect(spy.calledOnceWith(invalidTask)).to.be.true
        done()
      }).catch(done)
  })
  it('Validates valid tasks', (done) => {
    let validTask = buildTask('Blue', -1)
    validTask.id = task.id
    let spy = sinon.spy(validationHelper, "validateTask")
    componentUnderTest.editTask(validTask.id, validTask)
      .then(result => {
        expect(spy.calledOnceWith(validTask)).to.be.true
        done()
      }).catch(done)
  })
})

describe('The getTaskById method of the task service', () => {
  var task
  beforeEach(done => {
    task = new Task(buildTask('T-Rex', 0))
    task.save()
      .then((newTask) => {
        task = newTask
        done()
      }).catch(done)
  })
  it('Returns a promise', () => {
    utils.validateReturnsPromise(componentUnderTest.getTaskById(task.id))
  })
  it('Then returns a task', (done) => {
    componentUnderTest.getTaskById(task.id)
      .then(foundTask => {
        expect(foundTask).to.be.an('object')
        validateTask(task, foundTask)
        done()
      }).catch(done)
  })
  it('Fails if you don\'t pass anything', (done) => {
    componentUnderTest.getTaskById()
      .then(() => {
        done(new Error('getTaskById should fail without arguments'))
      }).catch(err => {
        expect(err).not.to.be.undefined
        done()
      })
  })
  it('Fails if you pass null', (done) => {
    componentUnderTest.getTaskById(null)
      .then(() => {
        done(new Error('getTaskById should fail when passed null'))
      }).catch(err => {
        expect(err).not.to.be.undefined
        done()
      })
  })
})

describe('The deleteTask method of the task service', () => {
  var task
  beforeEach(done => {
    task = new Task(buildTask('T-Rex', 0))
    task.save()
      .then((newTask) => {
        task = newTask
        done()
      }).catch(done)
  })
  it('Returns a promise', () => {
    utils.validateReturnsPromise(componentUnderTest.deleteTask(task.id))
  })
  it('Then returns nothing', (done) => {
    componentUnderTest.deleteTask(task.id)
      .then(result => {
        expect(result).to.be.undefined
        done()
      }).catch(done)
  })
  it('Fails if you don\'t pass anything', (done) => {
    componentUnderTest.deleteTask()
      .then(() => {
        done(new Error('deleteTask should fail without arguments'))
      }).catch(err => {
        expect(err).not.to.be.undefined
        done()
      })
  })
  it('Fails if you pass null', (done) => {
    componentUnderTest.deleteTask(null)
      .then(() => {
        done(new Error('deleteTask should fail when passed null'))
      }).catch(err => {
        expect(err).not.to.be.undefined
        done()
      })
  })
})

describe('The toggleComplete method of the task service', () => {
  var task
  beforeEach(done => {
    task = new Task(buildTask('Favor', 0))
    task.save()
      .then((newTask) => {
        task = newTask
        done()
      }).catch(done)
  })
  it('Returns a promise', () => {
    utils.validateReturnsPromise(componentUnderTest.toggleComplete(task.id))
  })
  it('Then returns a task', (done) => {
    componentUnderTest.toggleComplete(task.id)
      .then(foundTask => {
        expect(foundTask).to.be.an('object')
        foundTask.isComplete = !foundTask.isComplete //so that it will match the original task for validation purposes
        validateTask(task, foundTask)
        done()
      }).catch(done)
  })
  it('Fails if you don\'t pass anything', (done) => {
    componentUnderTest.toggleComplete()
      .then(() => {
        done(new Error('toggleComplete should fail without arguments'))
      }).catch(err => {
        expect(err).not.to.be.undefined
        done()
      })
  })
  it('Fails if you pass null', (done) => {
    componentUnderTest.toggleComplete(null)
      .then(() => {
        done(new Error('toggleComplete should fail when passed null'))
      }).catch(err => {
        expect(err).not.to.be.undefined
        done()
      })
  })
  it('Updates isComplete to positive if it was previously negative', (done) => {
    expect(task.isComplete).to.be.false
    componentUnderTest.toggleComplete(task.id)
      .then(task => {
        expect(task.isComplete).to.be.true
        done()
      }).catch(done)
  })
  it('Updates isComplete to negative if it was previously positive', (done) => {
    expect(task.isComplete).to.be.false
    componentUnderTest.toggleComplete(task.id)
      .then(task => {
        expect(task.isComplete).to.be.true
        return componentUnderTest.toggleComplete(task.id)
      }).then(task => {
        expect(task.isComplete).to.be.false
        done()
      }).catch(done)
  })
})

describe('The findByTag method of the task service', () => {
  var task
  beforeEach(done => {
    task = new Task(buildTask('Favor', 0, ['hello', 'goodbye']))
    task.save()
      .then((newTask) => {
        task = newTask
        done()
      }).catch(done)
  })
  it('Returns a promise', () => {
    utils.validateReturnsPromise(componentUnderTest.findByTag('hello'))
  })
  it('Returns matching tasks', (done) => {
    let tasks = []
    tasks.push(new Task(buildTask('Cat', 0, ['capitalist', 'socialist'])))
    tasks.push(new Task(buildTask('Dog', 0, ['socialist'])))
    tasks.push(new Task(buildTask('Horse', 0)))
    Task.create(tasks)
      .then(tasks => {
        return componentUnderTest.findByTag('socialist')
      }).then(socialistTasks => {
        expect(socialistTasks).to.be.an('array').and.have.lengthOf(2)
        return componentUnderTest.findByTag('capitalist')
      }).then(capitalistTasks => {
        expect(capitalistTasks).to.be.an('array').and.have.lengthOf(1)
        done()
      }).catch(done)
  })
  it('Fails if you don\'t pass anything', (done) => {
    componentUnderTest.findByTag()
      .then(() => {
        done(new Error('findByTag should fail without arguments'))
      }).catch(err => {
        expect(err).not.to.be.undefined
        done()
      })
  })
  it('Fails if you pass null', (done) => {
    componentUnderTest.findByTag(null)
      .then(() => {
        done(new Error('findByTag should fail when passed null'))
      }).catch(err => {
        expect(err).not.to.be.undefined
        done()
      })
  })
})

describe('The postponeAllOverdue method of the task service', () => {
  var tasks = []
  beforeEach(done => {
    tasks.push(new Task(buildTask('Ornithomimus', 0, null, moment().add(-1, 'days').toDate(), null, false)))
    tasks.push(new Task(buildTask('Galimumus', 0, null, moment().add(-3, 'days').toDate(), null, false)))
    tasks.push(new Task(buildTask('Brontosaurus', 0, null, moment().add(1, 'days').toDate(), null, false)))
    tasks.push(new Task(buildTask('Apatasaurus', 0, null, moment().add(-6, 'days').toDate(), null, false)))
    tasks.push(new Task(buildTask('Parasaurolophus', 0, null, moment().add(-5, 'days').toDate(), null, true)))
    Task.create(tasks)
      .then((savedTasks) => {
        done()
      }).catch(done)
  })
  it('Returns a promise', () => {
    utils.validateReturnsPromise(componentUnderTest.postponeAllOverdue())
  })
  it('Fails if you pass null', (done) => {
    componentUnderTest.findByTag(null)
      .then(() => {
        done(new Error('findByTag should fail when passed null'))
      }).catch(err => {
        expect(err).not.to.be.undefined
        done()
      })
  })
  it('Updates all incomplete overdue tasks to be due at the end of the current day', (done) => {
    let taskIds = []
    let endOfDay = moment().endOf('day').toDate()
    Task.find().byOverdue()
      .then(tasks => {
        expect(tasks).to.be.an('array').that.has.a.lengthOf(3)
        tasks.forEach(task => {
          expect(task.dueDate).beforeDate(endOfDay)
          expect(task.dueDate).beforeTime(endOfDay)
          expect(task.isComplete).to.be.false
          taskIds.push(task.id)
        });
        return componentUnderTest.postponeAllOverdue()
      }).then(nModified => {
        expect(nModified).to.be.a('number').and.to.equal(3)
        return Task.find().byOverdue()
      }).then(tasks => {
          expect(tasks).to.be.an('array').that.is.empty
          return Task.find({ id: { $in: taskIds } })
      }).then(tasks => {
          tasks.forEach(task => {
            expect(task.dueDate).equalDate(endOfDay)
            expect(task.dueDate).equalTime(endOfDay)
            expect(task.isComplete).to.be.false
          });
          done()
      }).catch(done)
  })
})

describe('The removeAllCompleted method of the task service', () => {
  var tasks = []
  beforeEach(done => {
    tasks.push(new Task(buildTask('Riddle', 0, null, moment().add(-1, 'days').toDate(), null, true)))
    tasks.push(new Task(buildTask('Puzzle', 0, null, moment().add(-3, 'days').toDate(), null, true)))
    tasks.push(new Task(buildTask('Game', 0, null, moment().add(1, 'days').toDate(), null, false)))
    Task.create(tasks)
      .then((savedTasks) => {
        done()
      }).catch(done)
  })
  it('Returns a promise', () => {
    utils.validateReturnsPromise(componentUnderTest.removeAllCompleted())
  })
  it('Deletes only completed tasks', (done) => {
    Task.countDocuments().byComplete(true)
      .then(completeBeforeRemoval => {
        expect(completeBeforeRemoval).to.equal(2)
        return Task.countDocuments().byComplete(false)
      }).then(incompleteBeforeRemoval => {
        expect(incompleteBeforeRemoval).to.equal(1)
        return componentUnderTest.removeAllCompleted()
      }).then(() => {
        return Task.countDocuments().byComplete(true)
      }).then(completeAfterRemoval => {
        expect(completeAfterRemoval).to.equal(0)
        return Task.countDocuments().byComplete(false)
      }).then(incompleteAfterRemoval => {
        expect(incompleteAfterRemoval).to.equal(1)
        done()
      }).catch(done)
  })
})