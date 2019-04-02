const chai = require('chai')
  , chaiDatetime = require('chai-datetime')

chai.use(chaiDatetime)
let expect = chai.expect

module.exports = {
  validateReturnsPromise: (result) => {
    expect(result.then).to.be.a('Function')
    expect(result.catch).to.be.a('Function')
    Promise.resolve(result)
  },
  validateDefaultsToNow: (date) => {
    let nowMinus5 = new Date()
    nowMinus5.setMinutes(nowMinus5.getMinutes() - 2)
    let nowPlus5 = new Date()
    nowPlus5.setMinutes(nowPlus5.getMinutes() + 2)
    expect(date).to.equalDate(new Date())
    expect(date.getTime()).to.be.within(nowMinus5.getTime(), nowPlus5.getTime())
  }
}