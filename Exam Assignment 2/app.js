/**
 * Starting point of application
*/

'use strict'

let express = require('express')
let session = require('express-session')
let path = require('path')
let exphbs = require('express-handlebars')
let bodyParser = require('body-parser')

let mongoose = require('./config/mongoose.js')

let app = express()
let port = process.env.PORT || 8000

// Connect to the database
mongoose()

// View engine
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}))
app.set('view engine', '.hbs')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
  name: 'serversession',
  secret: 'fEy4Kj6GEceyTJuhSS2H',
  saveUninitialized: false,
  resave: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}))

app.use(function (req, res, next) {
  res.locals.session = req.session
  next()
})

// Flash messages
app.use(function (req, res, next) {
  if (req.session.flash) {
    res.locals.flash = req.session.flash

    delete req.session.flash
  }

  if (req.session.loggedin) {
    res.locals.loggedin = req.session.loggedin
  }

  next()
})

// Routes
app.use('/', require('./routes/home.js'))
app.use('/', require('./routes/snippet.js'))
app.use('/', require('./routes/register.js'))

// 404 error handler
app.use(function (req, res, next) {
  res.status(404)
  res.render('error/404')
})

// 400 error handler
app.use(function (err, req, res, next) {
  if (err.status !== 400) {
    return next(err)
  }
  console.log(err.stack)
  res.status(400).render('error/400')
})

// 500 error handler
app.use(function (err, req, res, next) {
  console.log(err.stack)
  res.status(500).render('error/500')
})

// Launch
app.listen(port, function () {
  console.log('Express app listening on port ' + port)
  console.log('Press Ctrl-C to terminate...')
})
