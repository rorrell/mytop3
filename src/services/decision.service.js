const Decision = require('../models/Decision.model')
  , Task = require('../models/Task.model')
  , validator = require('../helpers/validation.helper')
  , moment = require('moment')

function decisionFromRequestBody(body) {
  //picked
  if(body.top3s.startsWith("|")) {
    body.top3s = body.top3s.substr(1)
  }
  let top3s = []
  body.top3s.split("|").forEach(element => {
    top3s.push({ id: element })
  });

  //unpicked
  if (body.others.startsWith("|")) {
    body.others = body.others.substr(1)
  }
  let others = []
  body.others.split("|").forEach(element => {
    others.push({ id: element })
  });

  //combine and return
  return {
    top3s: top3s,
    others: others
  }
}

module.exports = {
  addDecision: (reqBody) => {
    return new Promise((resolve, reject) => {
      let tempDec = decisionFromRequestBody(reqBody)
      let errors = validator.validateDecision(tempDec)
      if(errors.length > 0) {
        resolve({ errors: errors, decision: tempDec })
      } else {
        new Decision(tempDec)
          .save()
          .then(decision => {
            resolve({ errors: [], decision: decision })
          }).catch(reject)
      }
    })
  }
}