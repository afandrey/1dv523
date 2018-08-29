/**
 * Starting point of application
 */

'use strict'

let express = require('express')
let exphbs = require('express-handlebars')
let path = require('path')
let bodyParser = require('body-parser')
let https = require('https')
let fs = require('fs')
require('dotenv').config()

let GithubWebhook = require('express-github-webhook')
let webhookHandler = GithubWebhook({ path: '/', secret: process.env.TOKEN })

let app = express()
let port = process.env.PORT || 3000

let server = https.createServer({
  key: fs.readFileSync('./config/sslcerts/key.pem'),
  cert: fs.readFileSync('./config/sslcerts/cert.pem')
}, app).listen(port, function () {
  console.log('Express app listening on port ' + port)
  console.log('Press Ctrl-C to terminate...')
})

let io = require('socket.io')(server)

// View engine
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}))
app.set('view engine', '.hbs')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(webhookHandler)

io.on('connection', function (socket) {
  webhookHandler.on('issues', function (repo, data) {
    let action = data.action
    let id = data.issue.id
    let number = data.issue.number
    let user = data.issue.user.login
    let link = data.issue.html_url
    let title = data.issue.title
    let body = data.issue.body
    let commentCounter = data.issue.comments
    let createdAt = data.issue.created_at
    let updatedAt = data.issue.updated_at

    socket.emit('issue', { action: action, title: title, user: user })

    if (action === 'opened' || action === 'reopened') {
      socket.emit('issueList', { title: title, body: body, link: link, commentCounter: commentCounter, createdAt: createdAt, updatedAt: updatedAt, number: number, id: id })
    } else if (action === 'closed') {
      socket.emit('issueRemove', { title: title, body: body, link: link, commentCounter: commentCounter, createdAt: createdAt, updatedAt: updatedAt, number: number, id: id })
    }
  })

  webhookHandler.on('issue_comment', function (repo, data) {
    let action = data.action
    let id = data.issue.id
    let user = data.comment.user.login
    let title = data.issue.title
    let commentCounter = data.issue.comments
    let comment = data.comment.body
    let number = data.issue.number

    socket.emit('issue_comment', { action: action, title: title, user: user, comment: comment, commentCounter: commentCounter, number: number, id: id })
  })
})

webhookHandler.on('error', function (err, req, res) {
  if (err) {
    console.log(err)
  }
})

// Routes
app.use('/', require('./routes/home.js'))

// 404 error handler
app.use(function (req, res, next) {
  res.status(404).render('error/404')
})

// 400 error handler
app.use(function (err, req, res, next) {
  if (err.status !== 400) {
    return next(err)
  }
  console.error(err.stack)
  res.status(400).render('error/400')
})

// 500 error handler
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).render('error/500')
})
