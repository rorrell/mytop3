module.exports = {
  errorHandler: function (err, req, res, next) {
    if (err) {
      console.log(err)
      if (!err.statusCode) {
        err.statusCode = 500
      }
      req.flash('error_msg', err.message)
    }
  }
  // unusedRouteHandler: function(req, res, next) {
  //   if(req.url == '/favicon.ico') { //ignore favicon
  //     return next()
  //   }
  //   let err = new Error(`Page not found: ${req.url}`)
  //   err.statusCode = 404
  //   next(err)
  // },
  // ensureAuthenticated: (req, res, next) => {
  //   if (req.isAuthenticated()) {
  //     return next()
  //   }
  //   req.flash('error_msg', 'Not Authorized')
  //   res.redirect('/auth/login')
  // }
}