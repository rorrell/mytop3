const validator = require('./validation.helper')
  , moment = require('moment')

module.exports = {
  disableNavLinkIfAppropriate: (currentHref, linkHref, linkText) => {
    if (!validator.varIsDefinedStringAndNotEmpty(currentHref) || !validator.varIsDefinedStringAndNotEmpty(linkHref) || !validator.varIsDefinedStringAndNotEmpty(linkText)) {
      throw new SyntaxError('disableNavLinkIfAppropriate requires 3 non-empty string arguments')
    }
    if(currentHref === linkHref) {
      return `<a class="nav-link disabled" href="${linkHref}" tabindex="-1" aria-disabled="true">${linkText}</a>`
    } else {
      return `<a class="nav-link" href="${linkHref}">${linkText}</a>`
    }
  },
  formatDate: (date, format) => {
    if(!date) return ''
    let result = validator.varIsDefinedStringAndNotEmpty(format) ? moment(date).format(format) : moment(date).format()
    return result
  },
  urlifyTags: (tags) => {
    let resultArr = []
    if (tags) {
      tags.forEach(name => {
        resultArr.push(unescape('<a href="/tasks/tags/' + name + '">' + name + '</a>'))
      });
    }
    return resultArr.join(', ')
  },
  arrayToDelimitedList: (arr) => {
    if(arr) {
      return arr.join(', ')
    }
    return ''
  }
}