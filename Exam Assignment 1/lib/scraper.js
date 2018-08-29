var cheerio = require('cheerio')
var rp = require('request-promise')
var url = require('url')
var request = require('request')

var urlmerged

function getLinks (html) {
  var promises = []
  var arr = []

  var options = {
    transform: function (body) {
      return cheerio.load(body)
    }
  }

  html.forEach(function (url) {
    options.uri = url
    promises.push(rp(options))
  })

  var urlStr = String(html)

  return Promise.all(promises).then(function (value) {
    value.forEach(function ($) {
      $('a').filter('[href]')
        .map(function (i, link) {
          urlmerged = url.resolve(urlStr + '/', $(link).attr('href'))
          arr.push(urlmerged)
        })
    })

    return Promise.resolve(arr)
  })
}

function getCalendar (html) {
  var promises = []
  var arr = []

  var options = {
    transform: function (body) {
      return cheerio.load(body)
    }
  }

  html.forEach(function (url) {
    options.uri = url
    promises.push(rp(options))
  })

  return Promise.all(promises).then(function (value) {
    value.forEach(function ($) {
      $('th')
        .each(function (index1, link) {
          $('td')
            .each(function (index2, link2) {
              if (index1 === index2) {
                arr.push($(link).text() + $(link2).text())
              }
            })
        })
    })

    return Promise.resolve(arr)
  })
}

function getCinema (html) {
  var promises = []
  var arr = []

  var options = {
    transform: function (body) {
      return cheerio.load(body)
    }
  }

  html.forEach(function (url) {
    options.uri = url
    promises.push(rp(options))
  })

  return Promise.all(promises).then(function (value) {
    value.forEach(function ($) {
      var movies = $('option')
      $(movies).each(function (i, link) {
        if ($(link).attr('value') === '01' || $(link).attr('value') === '02' || $(link).attr('value') === '03') {
          arr.push($(link).attr('value'))
        }
      })
    })

    return Promise.resolve(arr)
  })
}

function getMovieInfo (html) {
  var promises = []
  var arr = []

  var options = {
    transform: function (body) {
      return cheerio.load(body)
    }
  }

  html.forEach(function (url) {
    options.uri = url
    promises.push(rp(options))
  })

  return Promise.all(promises).then(function (value) {
    value.forEach(function ($) {
      var info = JSON.parse($.text())
      for (var i = 0; i < info.length; i++) {
        if (info[i].status === 1 && info[i].day === '05') {
          arr.push({friday: {day: info[i].day, movie: info[i].movie, time: info[i].time}})
        }
        if (info[i].status === 1 && info[i].day === '06') {
          arr.push({saturday: {day: info[i].day, movie: info[i].movie, time: info[i].time}})
        }
        if (info[i].status === 1 && info[i].day === '07') {
          arr.push({sunday: {day: info[i].day, movie: info[i].movie, time: info[i].time}})
        }
      }
    })

    return Promise.resolve(arr)
  })
}

function getRestaurant (html) {
  var promises = []
  var arr = []
  promises.push(cheerio.load(html))

  return Promise.all(promises).then(function (value) {
    value.forEach(function ($) {
      $('input').filter('[name^="group1"]')
                .map(function (i, link) {
                  if ($(link).attr('value').startsWith('fri')) {
                    arr.push($(link).attr('value'))
                  }
                  if ($(link).attr('value').startsWith('sat')) {
                    arr.push($(link).attr('value'))
                  }
                  if ($(link).attr('value').startsWith('sun')) {
                    arr.push($(link).attr('value'))
                  }
                })
    })

    return Promise.resolve(arr)
  })
}

function getLoginPath (html) {
  var promises = []
  var path

  var options = {
    transform: function (body) {
      return cheerio.load(body)
    }
  }

  html.forEach(function (url) {
    options.uri = url
    promises.push(rp(options))
  })

  return Promise.all(promises).then(function (value) {
    value.forEach(function ($) {
      $('form').filter('[action^="/"]')
              .map(function (i, link) {
                path = $(link).attr('action')
                path = path.split('/')[2]
                path = ('/') + path
              })
    })

    return Promise.resolve(path)
  })
}

function getCookie (html) {
  return new Promise(function (resolve, reject) {
    request.post({
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      url: html,
      form: {username: 'zeke',
        password: 'coys',
        submit: 'login'}
    }, function (err, res, body) {
      if (err) {

      } else {
        var set = res.headers['set-cookie'][0]
        var str = body
        str = str.split('/')[1]
        str = ('/') + str
        var s = set.split(';', 1)
        resolve([s[0].toString(), str])
      }
    })
  })
}

function setCookie (url, domain, cookieValue) {
  return new Promise(function (resolve, reject) {
    var jar = request.jar()
    var cookie = request.cookie(cookieValue)
    cookie.domain = domain
    cookie.path = '/'

    jar.setCookie(cookie, url, function (err, cookie) {
      if (err) {

      }
    })

    request({
      uri: url,
      method: 'GET',
      jar: jar
    }, function (err, res, body) {
      if (err) {

      } else {
        resolve(body)
      }
    })
  })
}

module.exports = {
  getLinks: getLinks,
  getCalendar: getCalendar,
  getCinema: getCinema,
  getMovieInfo: getMovieInfo,
  getRestaurant: getRestaurant,
  getLoginPath: getLoginPath,
  getCookie: getCookie,
  setCookie: setCookie
}
