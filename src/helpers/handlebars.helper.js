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
  },
  isoDurationToForm: (dur) => {
    let arr
    if(!dur) {
      arr = ['', '']
    } else {
      arr = moment.duration(dur).humanize().split(' ')
      switch(arr[1]) {
        case "days":
        case "weeks":
        case "months":
        case "years":
          break
        default:
          arr[1] = ''
      }
    }
    return `<div class="form-row mb-4">
      <div class="col">
        <input type="text" name="repeatAmt" class="form-control" value="${arr[0]}">
      </div>
      <div class="col">
        <select name="repeatType" class="form-control">
          <option value=""${arr[1] === '' ? ' selected' : ''}>None</option>
          <option value="days"${arr[1] === 'days' ? ' selected' : ''}>Days</option>
          <option value="weeks"${arr[1] === 'weeks' ? ' selected' : ''}>Weeks</option>
          <option value="months"${arr[1] === 'months' ? ' selected' : ''}>Months</option>
          <option value="years"${arr[1] === 'years' ? ' selected' : ''}>Years</option>
        </select>
      </div>
    </div>`
  }
}