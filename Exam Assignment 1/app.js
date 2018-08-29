/**
 * Starting point
 * http://vhost3.lnu.se:20080/weekend
 */

var scrape = require('./lib/scraper')
var args = process.argv.slice(2)

var links
var availableDays
var days = {}
var countFri = 0
var countSat = 0
var countSun = 0
var movieUrl = []
var cinemaResult
var cinemaDetails
var loginPath

if (args.length === 0) {
  console.log('Error: no arguments')
  process.exit(0)
}

console.log('Web agent start running...')

scrape.getLinks(args).then(function (startLinks) {
  return Promise.resolve(startLinks)
}).then(function (startLinks) {
  links = startLinks

  return scrape.getLinks([startLinks[0]]).then(function (calendarLinks) {
    console.log('Fetching links... OK')
    return calendarLinks
  })
}).then(function (calLinks) {
  return scrape.getCalendar(calLinks).then(function (calArr) {
    return calArr
  })
}).then(function (available) {
  availableDays = available
  var fridayok = 'fridayok'
  var saturdayok = 'saturdayok'
  var sundayok = 'sundayok'

  for (var i = 0; i < availableDays.length; i++) {
    if (availableDays[i].toUpperCase() === fridayok.toUpperCase()) {
      countFri++
    }
    if (availableDays[i].toUpperCase() === saturdayok.toUpperCase()) {
      countSat++
    }
    if (availableDays[i].toUpperCase() === sundayok.toUpperCase()) {
      countSun++
    }
  }

  if (countFri < 3 && countSat < 3 && countSun < 3) {
    console.log('No day available')
    process.exit(0)
  }

  if (countFri === 3) {
    days['05'] = 'Friday'
  }
  if (countSat === 3) {
    days['06'] = 'Saturday'
  }
  if (countSun === 3) {
    days['07'] = 'Sunday'
  }

  console.log('Finding free days... OK')

  return scrape.getCinema([links[1]]).then(function (cinemaArr) {
    return cinemaArr
  })
}).then(function (availableMovies) {
  cinemaDetails = availableMovies
  for (var key in days) {
    for (var k in availableMovies) {
      movieUrl.push(links[1].concat('/check?day=' + key + '&movie=' + availableMovies[k]))
    }
  }

  return scrape.getMovieInfo(movieUrl).then(function (body) {
    console.log('Fetching movie shows... OK')
    return body
  })
}).then(function (cinemaRes) {
  cinemaResult = cinemaRes

  return scrape.getLoginPath([links[2]]).then(function (path) {
    return path
  })
}).then(function (logPath) {
  loginPath = logPath
}).then(function (cookiePath) {
  return scrape.getCookie(links[2] + loginPath)
}).then(function (cookieValue) {
  var d = args.toString()
  var domain

  if (d.indexOf('://') > 1) {
    domain = d.split('/')[2]
  } else {
    domain = d.split('/')[0]
  }

  domain = domain.split(':')[0]

  var url = links[2] + loginPath + cookieValue[1]

  return scrape.setCookie(url, domain, cookieValue[0])
}).then(function (body) {
  return scrape.getRestaurant(body).then(function (result) {
    console.log('Fetching restaurant bookings... OK')
    return result
  })
}).then(function (results) {
  console.log('Putting together recommendations... OK')
  var i, j, k, m

  if (countFri === 3) {
    var availableFridays = []
    var friTimes = []

    for (i = 0; i < results.length; i++) {
      if (results[i].startsWith('fri')) {
        availableFridays.push(results[i])
      }
    }

    for (j = 0; j < availableFridays.length; j++) {
      var friday = availableFridays[j].toString()
      if (friday.indexOf('fri') > -1) {
        var movieFriday = friday.split('fri')[1]
        movieFriday = movieFriday.slice(0, -2)
        movieFriday = parseInt(movieFriday)
        movieFriday = movieFriday - 2
        movieFriday = movieFriday.toString()
        movieFriday = movieFriday + ':00'
        friTimes.push(movieFriday)
      }
    }
    var fri = cinemaResult.filter(function (f) {
      return f.friday
    })

    for (k = 0; k < fri.length; k++) {
      for (m = 0; m < friTimes.length; m++) {
        if (fri[k].friday.time === friTimes[m]) {
          var friStart = fri[k].friday.time
          friStart = friStart.slice(0, -3)
          var friEnd = friStart

          friStart = parseInt(friStart) + 2
          friEnd = parseInt(friEnd) + 4
          var fridayTime = friStart + ':00 and ' + friEnd + ':00'

          if (cinemaDetails[0] === fri[k].friday.movie) {
            console.log('* On Friday there is a free table between ' + fridayTime + ', after you have seen "The Flying Deuces" which starts at ' + fri[k].friday.time)
          } else if (cinemaDetails[1] === fri[k].friday.movie) {
            console.log('* On Friday there is a free table between ' + fridayTime + ', after you have seen "Keep Your Seats, Please" which starts at ' + fri[k].friday.time)
          } else if (cinemaDetails[2] === fri[k].friday.movie) {
            console.log('* On Friday there is a free table between ' + fridayTime + ', after you have seen "A Day at the Races" which starts at ' + fri[k].friday.time)
          }
        }
      }
    }
  }

  if (countSat === 3) {
    var availableSaturdays = []
    var satTimes = []

    for (i = 0; i < results.length; i++) {
      if (results[i].startsWith('sat')) {
        availableSaturdays.push(results[i])
      }
    }

    for (j = 0; j < availableSaturdays.length; j++) {
      var saturday = availableSaturdays[j].toString()

      if (saturday.indexOf('sat') > -1) {
        var movieSaturday = saturday.split('sat')[1]
        movieSaturday = movieSaturday.slice(0, -2)
        movieSaturday = parseInt(movieSaturday)
        movieSaturday = movieSaturday - 2
        movieSaturday = movieSaturday.toString()
        movieSaturday = movieSaturday + ':00'
        satTimes.push(movieSaturday)
      }
    }

    var sat = cinemaResult.filter(function (s) {
      return s.saturday
    })

    for (k = 0; k < sat.length; k++) {
      for (m = 0; m < satTimes.length; m++) {
        if (sat[k].saturday.time === satTimes[m]) {
          var satStart = sat[k].saturday.time
          satStart = satStart.slice(0, -3)
          var satEnd = satStart

          satStart = parseInt(satStart) + 2
          satEnd = parseInt(satEnd) + 4
          var saturdayTime = satStart + ':00 and ' + satEnd + ':00'

          if (cinemaDetails[0] === sat[k].saturday.movie) {
            console.log('* On Saturday there is a free table between ' + saturdayTime + ', after you have seen "The Flying Deuces" which starts at ' + sat[k].saturday.time)
          } else if (cinemaDetails[1] === sat[k].saturday.movie) {
            console.log('* On Saturday there is a free table between ' + saturdayTime + ', after you have seen "Keep Your Seats, Please" which starts at ' + sat[k].saturday.time)
          } else if (cinemaDetails[2] === sat[k].saturday.movie) {
            console.log('* On Saturday there is a free table between ' + saturdayTime + ', after you have seen "A Day at the Races" which starts at ' + sat[k].saturday.time)
          }
        }
      }
    }
  }

  if (countSun === 3) {
    var availableSundays = []
    var sunTimes = []

    for (i = 0; i < results.length; i++) {
      if (results[i].startsWith('sun')) {
        availableSundays.push(results[i])
      }
    }

    for (j = 0; j < availableSundays.length; j++) {
      var sunday = availableSundays[j].toString()

      if (sunday.indexOf('sun') > -1) {
        var movieSunday = sunday.split('sun')[1]
        movieSunday = movieSunday.slice(0, -2)
        movieSunday = parseInt(movieSunday)
        movieSunday = movieSunday - 2
        movieSunday = movieSunday.toString()
        movieSunday = movieSunday + ':00'
        sunTimes.push(movieSunday)
      }
    }

    var sun = cinemaResult.filter(function (s) {
      return s.sunday
    })

    for (k = 0; k < sun.length; k++) {
      for (m = 0; m < sunTimes.length; m++) {
        if (sun[k].sunday.time === sunTimes[m]) {
          var sunStart = sun[k].sunday.time
          sunStart = sunStart.slice(0, -3)
          var sunEnd = sunStart

          sunStart = parseInt(sunStart) + 2
          sunEnd = parseInt(sunEnd) + 4
          var sundayTime = sunStart + ':00 and ' + sunEnd + ':00'

          if (cinemaDetails[0] === sun[k].sunday.movie) {
            console.log('* On Sunday there is a free table between ' + sundayTime + ', after you have seen "The Flying Deuces" which starts at ' + sun[k].sunday.time)
          } else if (cinemaDetails[1] === sun[k].sunday.movie) {
            console.log('* On Sunday there is a free table between ' + sundayTime + ', after you have seen "Keep Your Seats, Please" which starts at ' + sun[k].sunday.time)
          } else if (cinemaDetails[2] === sun[k].sunday.movie) {
            console.log('* On Sunday there is a free table between ' + sundayTime + ', after you have seen "A Day at the Races" which starts at ' + sun[k].sunday.time)
          }
        }
      }
    }
  }
})
