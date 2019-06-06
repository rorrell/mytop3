const express = require('express')
  , exphbs = require('express-handlebars')
  , path = require('path')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , mongooseHelper = require('./helpers/mongoose.helper')
  , hbsHelper = require('./helpers/handlebars.helper')
  , expressHelper = require('./helpers/express.helper')
  , keys = require('./config/keys/keys')
  , session = require('./config/session')
  , flash = require('connect-flash')

const app = express()

//handlebars
app.set('views', path.join(__dirname, 'views'))
app.engine('handlebars', exphbs({
  helpers: {
    disableNavLinkIfAppropriate: hbsHelper.disableNavLinkIfAppropriate,
    formatDate: hbsHelper.formatDate,
    urlifyTags: hbsHelper.urlifyTags,
    arrayToDelimitedList: hbsHelper.arrayToDelimitedList,
    isoDurationToForm: hbsHelper.isoDurationToForm
  },
  defaultLayout: 'main'
}))
app.set('view engine', 'handlebars')

//body parser
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())

//static folder
app.use(express.static('public'))
app.use('/js', express.static('node_modules/bootstrap/dist/js'))
app.use('/js', express.static('node_modules/jquery/dist'))
app.use('/css', express.static('node_modules/bootstrap/dist/css'))
app.use('/css', express.static('node_modules/@fortawesome/fontawesome-free/css'))
app.use('/js', express.static('node_modules/@fortawesome/fontawesome-free/js'))
app.use('/webfonts', express.static('node_modules/@fortawesome/fontawesome-free/webfonts'))

//method override
app.use(methodOverride('_method'))

//mongoose
var setup = function() {
  return mongooseHelper.connectToMongoose()
  .then(connection => {
    console.log('MongoDB Connected')

    //express session
    app.use(session(connection))

    //connect flash
    app.use(flash())

    // Global variables
    app.use((req, res, next) => {
      res.locals.success_msg = req.flash('success_msg')
      res.locals.error_msg = req.flash('error_msg')
      res.locals.error = req.flash('error')
      // res.locals.user = req.user || null
      res.locals.url = req.url
      next()
    })

    // Routes
    var indexRoutes = require('./routes/index.routes')
    app.use('/', indexRoutes)
    var taskRoutes = require('./routes/task.routes')
    app.use('/tasks', taskRoutes)

    // Error handling
    app.use(expressHelper.errorHandler)

    return app
  }).catch(console.log)
}

module.exports = setup