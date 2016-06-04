var http = require('http')
var util = require('util')
// dependencies
var express = require('express')
var app = express()
var request = require('request')
var bodyParser = require('body-parser')
var morgan = require('morgan')
var passport = require('passport')
var BasicStrategy = require('passport-http').BasicStrategy
var crypto = require('crypto');

// Firebase
var Firebase = require('firebase')
var myFirebaseRef = new Firebase('https://checkserver.firebaseio.com/tiles')
var myFirebaseRefUsers = new Firebase('https://checkserver.firebaseio.com/users')

var FirebaseTokenGenerator = require('firebase-token-generator')
var tokenGenerator = new FirebaseTokenGenerator(process.env.firebasesecret)
var token = tokenGenerator.createToken({ uid: 'checkserver', some: 'arbitrary', data: 'here' })

myFirebaseRef.authWithCustomToken(token, function (error, authData) {
  if (error) {
    console.log('Login Failed!', error)
  } else {
    console.log('Login Succeeded!', authData)
  }
})
myFirebaseRefUsers.authWithCustomToken(token, function (error, authData) {
  if (error) {
    console.log('Login Failed!', error)
  } else {
    console.log('Login Succeeded!')
  }
})

// CORS middleware
var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  next()
}

app.use(allowCrossDomain)
app.use(morgan("combined"))
app.use(bodyParser.json()) // for parsing application/json
app.use(passport.initialize())

var app_port = process.env.app_port || 3000
var app_host = process.env.app_host || '0.0.0.0'

app.listen(app_port, app_host, function () {
  console.log('App listen on Port ' + app_port)
})
passport.use(new BasicStrategy({
  },
  function(username, password, done) {
    process.nextTick(function () {
      myFirebaseRefUsers.on('value', function (snapshot) {
      var y = snapshot.val()
        if (y.hasOwnProperty(username)) {
          var md5pass = crypto.createHash('md5').update(password).digest('hex');
          if(md5pass === y[username].pass) {
            done(null, true)
          } else {
            done(null, false)
          }
        } else {
          done(null, false)
        }
    })
    })
  }
));

app.get('/', passport.authenticate('basic', { session: false }), function (req, res) {
  var titlelist = ''
  var i = 0
  myFirebaseRef.on('value', function (snapshot) {
    var y = snapshot.val()
    for (var k in y) {
      if (y.hasOwnProperty(k)) {
        i = i + 1
        if (i === 1) {
          titlelist = titlelist + '{'
          titlelist = titlelist + '"title":"' + k + '"'
          titlelist = titlelist + ', "status":"' + y[k].status + '"'
          titlelist = titlelist + ', "icon":"' + y[k].icon + '"'
          titlelist = titlelist + '}'
        } else {
          titlelist = titlelist + ', { "title":"' + k + '"'
          titlelist = titlelist + ', "status":"' + y[k].status + '"'
          titlelist = titlelist + ', "icon":"' + y[k].icon + '"'
          titlelist = titlelist + '}'
        }
      }
    }
  })
  var titlelista = JSON.parse('[' + titlelist + ']')
  res.send(titlelista)
})

app.delete('/delete', passport.authenticate('basic', { session: false }), function (req, res) {
  var delItem = req.body
  // Prüfung ob alle Daten da sind
  if (delItem.name !== undefined) {
    var tilesRef = myFirebaseRef.child(delItem.name)
    tilesRef.remove()
    res.send("Entfernt")
  } else {
    res.send('Error of Data!')
  }
})

app.put('/update', passport.authenticate('basic', { session: false }), function (req, res) {
  var newItem = req.body
  if (newItem.name !== undefined && newItem.status !== undefined && newItem.icon !== undefined) {
    // Firebase
    var tilesRef = myFirebaseRef.child(newItem.name)
    tilesRef.set({
      title: newItem.name,
      icon: newItem.icon,
      status: newItem.status
    })
    res.send('Angelegt')
  } else {
    res.send('Data Error!')
  }
})
app.put('/newversion', passport.authenticate('basic', { session: false }), function (req, res) {
  var informations = req.body

  if (informations.appversion !== undefined) {
    request('http://entwicklung.intern.labcode.de/checkapp/' + informations.appversion + '/newversion' + informations.appversion + '.txt', function (error, response, body) {
      if (!error && response.statusCode === 200) {
        // New Version
        res.send('New Version') // Show New Version on Page /newversion
      } else {
        // No new Version
        res.send('No New Version') // Show No New Version on Page /newversion
      }
    })
  } else {
    res.send('Data Error')
  }
})
app.put('/register', passport.authenticate('basic', { session: false }), function (req, res) {
  var data = req.body
  if (data.pass !== undefined && data.name !== undefined && data.email !== undefined) {
    var regun = 1
    myFirebaseRefUsers.on('value', function (snapshotu) {
      var v = snapshotu.val()
      var regi = 1
      while (v.hasOwnProperty(regi)) {
        regun++
        regi++
      }
    })
    res.sendStatus(regun)
    var usersRef = myFirebaseRefUsers.child(regun)
    usersRef.set({
      pass: data.pass,
      name: data.name,
      email: data.email
    })
  } else {
    res.send('Data Error')
  }
})
app.put('/userdata', passport.authenticate('basic', { session: false}), function (req, res) {
  var data = req.body
  if (data.email !== undefined) {
    var userdata = ''
    myFirebaseRefUsers.on('value', function (snapshot) {
      var y = snapshot.val()
      for (var k in y) {
        if (y.hasOwnProperty(k)) {
          if(y[k].email === data.email) {
            userdata = userdata + '{'
            userdata = userdata + '"username":"' + k + '"'
            userdata = userdata + ', "email":"' + y[k].email + '"'
            userdata = userdata + ', "name":"' + y[k].name + '"'
            userdata = userdata + '}'
          }
        }
      }
    })
    var userdataa = JSON.parse('[' + userdata + ']')
    res.send(userdataa)
  }
})
