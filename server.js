var http = require('http');
var util = require('util');
//dependencies
var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');

// Firebase
var Firebase = require("firebase");
var myFirebaseRef = new Firebase("https://checkserver.firebaseio.com/tiles");
var myFirebaseRefRoot = new Firebase("https://checkserver.firebaseio.com/");

var FirebaseTokenGenerator = require("firebase-token-generator");
var tokenGenerator = new FirebaseTokenGenerator(process.env.firebasesecret);
var token = tokenGenerator.createToken({ uid: "checkserver", some: "arbitrary", data: "here" });

myFirebaseRef.authWithCustomToken(token, function(error, authData) {
  if (error) {
    console.log("Login Failed!", error);
  } else {
    console.log("Login Succeeded!", authData);
  }
});
myFirebaseRefRoot.authWithCustomToken(token, function(error, authData) {
  if (error) {
    console.log("Login Failed!", error);
  } else {
    console.log("Login Succeeded!");
  }
});

//CORS middleware
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
}

app.use(allowCrossDomain)
app.use(bodyParser.json()); // for parsing application/json

var app_port = process.env.app_port || 3000;
var app_host = process.env.app_host || '127.0.0.1';

app.listen(app_port, app_host, function() {
  console.log("App listen on Port " + app_port)
})
app.get('/', function(req, res) {
var titlelist = '';
var i = 0;
  myFirebaseRef.on("value", function(snapshot) {
    var y = snapshot.val();
    for(var k in y) {
    if(y.hasOwnProperty(k)) {
      i = i + 1;
      if (i == 1) {
        titlelist = titlelist + '{'
        titlelist = titlelist + '"title":"' + k + '"';
        titlelist = titlelist + ', "status":"' + y[k].status + '"';
        titlelist = titlelist + ', "icon":"' + y[k].icon + '"';
        titlelist = titlelist + '}'
      }
      else{
      titlelist = titlelist + ', { "title":"' + k + '"';
      titlelist = titlelist + ', "status":"' + y[k].status + '"';
      titlelist = titlelist + ', "icon":"' + y[k].icon + '"';
      titlelist = titlelist + '}'
      }
    }
}
})
var titlelista = JSON.parse('[' + titlelist + ']');
res.send(titlelista);

});

app.delete('/delete', function(req, res) {
  var delItem = req.body
    //Prüfung ob alle Daten da sind
  if (delItem.name !== undefined) {
    var index = todolist.findIndex(function(item) {
      if (item.name == delItem.name) {
        return true;
      } else {
        return false;
      }

    });
    todolist.splice(index, 1);
    res.send(todolist);

  } else {
    res.send('Error of Data!');
  }

});

app.put('/update', function(req, res) {
  var newItem = req.body
  if (newItem.name !== undefined && newItem.status !== undefined && newItem.icon !== undefined) {
        // Firebase
       var tilesRef = myFirebaseRef.child(newItem.name);
       tilesRef.set({
           title: newItem.name,
           icon: newItem.icon,
           status: newItem.status
       });
      res.send("Angelegt");

  } else {
    res.send('Data Error!');
  }

});
app.put('/newversion', function(req, res) {
  var informations = req.body

  if (informations.appversion !== undefined) {
    request('http://entwicklung.intern.labcode.de/checkapp/'+ informations.appversion +'/newversion'+ informations.appversion +'.txt', function(error, response, body) {
      if (!error && response.statusCode == 200) {
        //New Version
        res.send("New Version"); // Show New Version on Page /newversion
      } else {
        //No new Version
        res.send("No New Version"); //Show No New Version on Page /newversion
      }
    });
  }
  else {
    res.send("Data Error")
  }
});
//http.createServer(function(req, res) {
//    res.writeHead(200, {'Content-Type': 'text/plain'});
//    res.write('Hello World from Cloudnode\n\n');
//    res.end();
//s}).listen(app_port);
