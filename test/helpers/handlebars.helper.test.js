const chai = require('chai')
  , componentUnderTest = require('../../src/helpers/handlebars.helper')

let expect = chai.expect
let regexIsDisabledLink = new RegExp(/^<a[^<>]*disabled[^<>]*>.*<\/a>$/)

describe('disableNavLinkIfAppropriate method', () => {
  it('Returns a string', () => {
    let result = componentUnderTest.disableNavLinkIfAppropriate('blah', 'blah', 'blah')
    expect(result).to.be.a('string')
  })
  it('Returns a disabled link if currentHref equals linkHref', () => {
    let result = componentUnderTest.disableNavLinkIfAppropriate('cat', 'cat', 'Cat');
    let match = regexIsDisabledLink.test(result)
    expect(match).to.be.true
  })
  it('Returns an enabled link if currentHref doesn\'t equal linkHref', () => {
    let result = componentUnderTest.disableNavLinkIfAppropriate('cat', 'dog', 'animal')
    let match = regexIsDisabledLink.test(result)
    expect(match).to.be.false
  })
  it('Returns an error if there aren\'t three non-empty string arguments', () => {
    let data = [
      [undefined, undefined, undefined, true],
      [null, undefined, undefined, true],
      ['', undefined, undefined, true],
      ['parasaurolophus', undefined, undefined, true],
      ['parasaurolophus', null, undefined, true],
      ['parasaurolophus', '', undefined, true],
      ['parasaurolophus', 'ankylosaurus', undefined, true],
      ['parasaurolophus', 'ankylosaurus', null, true],
      ['parasaurolophus', 'ankylosaurus', '', true],
      ['parasaurolophus', 'ankylosaurus', 'spinosaurus', false]
    ]
    data.forEach(row => {
      let func = () => componentUnderTest.disableNavLinkIfAppropriate(row[0], row[1], row[2])
      if(row[3]) {
        expect(func).to.throw('disableNavLinkIfAppropriate requires 3 non-empty string arguments')
      } else {
        expect(func).to.not.throw('disableNavLinkIfAppropriate requires 3 non-empty string arguments')
      }
      
    });
  })
})