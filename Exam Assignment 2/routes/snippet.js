/**
 * Routes
*/

'use strict'

let router = require('express').Router()
let SnippetDB = require('../models/Snippets')

// Show all snippets
router.route('/show').get(function (req, res) {
  SnippetDB.find({}, function (err, snippets) {
    let snippetData = {
      snippets: snippets.map(function (snippets) {
        return {
          username: snippets.username,
          title: snippets.title,
          snippet: snippets.snippet,
          posted: snippets.posted,
          id: snippets._id
        }
      })
    }

    if (err) {
      res.render('snippets/show', {
        flash: {
          type: 'danger',
          intro: 'Something went wrong',
          message: err.message
        }
      })
    }
    res.render('snippets/show', snippetData)
  })
})

// Create new snippet if logged in
router.route('/create').get(function (req, res, next) {
  if (req.session.loggedin) {
    res.render('snippets/create')
  } else {
    req.session.flash = {
      type: 'danger',
      message: 'You need to be logged in to create a snippet'
    }
    res.redirect('/')
  }
}).post(function (req, res) {
  // Create snippet from input
  let newSnippet = new SnippetDB({
    username: req.session.user.username,
    title: req.body.title,
    snippet: req.body.snippet
  })

  // Save snippet to db
  newSnippet.save()
    .then(function () {
      req.session.flash = {
        type: 'success',
        message: 'Snippet was created successfully'
      }
      res.redirect('/show')
    }).catch(function (err) {
      req.session.flash = {
        type: 'danger',
        intro: 'Something went wrong',
        message: err.message
      }
      res.redirect('/create')
    })
})

// Update a snippet
router.route('/update/:id').get(function (req, res) {
  if (req.session.loggedin) {
    SnippetDB.findOne({ _id: req.params.id }, function (err, item) {
      if (err) {
        throw err
      }
      // Make sure snippet belongs to logged in user
      if (item.username === req.session.username) {
        SnippetDB.find({ _id: req.params.id }, function (err, snippets) {
          let snippetData = {
            snippets: snippets.map(function (snippets) {
              return {
                username: snippets.username,
                title: snippets.title,
                newSnippet: snippets.snippet,
                id: snippets._id
              }
            })
          }

          if (err) {
            res.render('snippets/show', {
              flash: {
                type: 'danger',
                intro: 'Something went wrong',
                message: err.message
              }
            })
          }
          res.render('snippets/update', snippetData)
        })
      } else {
        req.session.flash = {
          type: 'danger',
          message: 'This is not your snippet'
        }
        res.redirect('../show')
      }
    })
  } else {
    req.session.flash = {
      type: 'danger',
      message: 'You need to be logged in to update your snippet'
    }
    res.redirect('../show')
  }
})

// Updated snippet
router.post('/updated/:id', function (req, res) {
  if (req.session.loggedin) {
    SnippetDB.findOneAndUpdate({ _id: req.params.id }, { snippet: req.body.newSnippet }, (err, updatedSnippet, next) => {
      if (err) {
        next(err)
      }

      req.session.flash = {
        type: 'success',
        message: 'Snippet was updated'
      }
      res.redirect('/show')
    })
  } else {
    req.session.flash = {
      type: 'danger',
      message: 'You need to be logged in to update your snippet'
    }
    res.redirect('../show')
  }
})

// Delete a snippet
router.post('/delete/:id', function (req, res, next) {
  if (req.session.loggedin) {
    SnippetDB.findOne({ _id: req.params.id }, function (err, item) {
      if (err) {
        throw err
      }
      // Make sure snippet belongs to logged in user
      if (item.username === req.session.username) {
        SnippetDB.findOneAndRemove({ _id: req.params.id }, function (err) {
          if (err) {
            next(err)
          }
          req.session.flash = {
            type: 'success',
            message: 'Snippet was deleted'
          }
          res.redirect('/show')
        })
      } else {
        req.session.flash = {
          type: 'danger',
          message: 'This is not your snippet'
        }
        res.redirect('../show')
      }
    })
  } else {
    req.session.flash = {
      type: 'danger',
      message: 'You need to be logged in to delete your snippet'
    }
    res.redirect('../show')
  }
})

module.exports = router
