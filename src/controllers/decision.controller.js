const service = require('../services/decision.service')
  , validator = require('../helpers/validation.helper')

module.exports = {
  addPost: (req, res, next) => {
    service.addDecision(req.body).then(result => {
      if (result.errors.length > 0) {
        res.render('tasks/pick', {
          title: "Pick Next 3 Tasks",
          errors: result.errors,
          decision: result.decision
        })
      } else {
        req.flash('success_msg', `Tasks picked`)
        res.redirect(`/tasks`)
      }
    }).catch(next)
  }
}