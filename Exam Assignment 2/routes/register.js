/**
 * Routes
*/

'use strict'

let router = require('express').Router()
let Users = require('../models/Users')

// Render register page
router.route('/register').get(function (req, res) {
  res.render('home/register')
}).post(function (req, res) {
  // Creating a new user from input
  let user = new Users({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  })

  // save new user to db
  user.save()
        .then(function () {
          req.session.flash = {
            type: 'success',
            message: 'Register successful'
          }
          res.redirect('/')
        }).catch(function (err) {
          if (err.name === 'ValidationError' && err.errors.username) {
            req.session.flash = {
              type: 'danger',
              message: 'Username cannot be longer than 20 characters'
            }
          } else if (err.name === 'ValidationError' && err.errors.password) {
            req.session.flash = {
              type: 'danger',
              message: 'Password has to be at least 6 characters'
            }
          } else {
            req.session.flash = {
              type: 'danger',
              message: err.message
            }
          }
          // Redirect to register page if register was not successful
          res.redirect('/register')
        })
})

module.exports = router
