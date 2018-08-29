/**
 * Routes
*/

'use strict'

let router = require('express').Router()
let github = require('octonode')
let client = github.client(process.env.TOKEN)
let ghrepo = client.repo('1dv023/af222ug-examination-3')

router.route('/').get(function (req, res) {
  ghrepo.issues(function (err, data) {
    if (err) {
      res.send(err)
    }
    let context = {
      issues: data.map(function (issue) {
        return {
          id: issue.id,
          number: issue.number,
          user: issue.user.login,
          title: issue.title,
          body: issue.body,
          link: issue.html_url,
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          commentCounter: issue.comments
        }
      })
    }
    res.render('home/index', { issues: context.issues })
  })
})

module.exports = router
