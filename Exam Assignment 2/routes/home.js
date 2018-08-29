/**
 * Routes
*/

'use strict'

let router = require('express').Router()
let Users = require('../models/Users')

// Render index page with login form
router.route('/').get(function (req, res) {
  res.render('home/index')
})

// Login user
router.post('/login', function (req, res) {
  Users.findOne({ username: req.body.username }, function (err, user) {
    if (err) {
      res.render('/', {
        flash: {
          type: 'danger',
          intro: 'Something went wrong',
          message: err.message
        }
      })
    }
    if (!user) {
      // if user does not exist
      req.session.flash = {
        type: 'danger',
        message: 'Username does not exist'
      }
      res.redirect('/')
    } else {
      user.comparePassword(req.body.password, function (err, pass) {
        if (err) {
          res.status(422).send('problem', err.message)
        } else if (!pass) {
          // if passwords do not match
          req.session.flash = {
            type: 'danger',
            message: 'Wrong password'
          }
          res.redirect('/')
        } else {
          req.session.flash = {
            type: 'success',
            message: 'Logged in'
          }
          req.session.user = user
          req.session.username = req.body.username
          req.session.loggedin = true
          res.redirect('../show')
        }
      })
    }
  })
})

// Logout user by destroy session
router.get('/logout', function (req, res) {
  req.session.destroy()
  res.redirect('/')
})

module.exports = router
