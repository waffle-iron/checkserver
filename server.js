var http = require('http');
var util = require('util');
//dependencies
var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');

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

var todolist = [{
  name: "Waschen",
  complete: false,
  icon: "img/waschen.svg"
}, {
  name: "Bügeln",
  complete: false,
  icon: "img/buegeln.svg"
}]

app.get('/', function(req, res) {
  res.send(todolist);
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

  if (newItem.name !== undefined && newItem.complete !== undefined && newItem.icon !== undefined) {
    var index = todolist.findIndex(function(item) {
      if (item.name == newItem.name) {
        return true;
      } else {
        return false;
      }
    })

    if (index == -1) {
      todolist.push(newItem);
      res.send("Angelegt, " + todolist);
    } else {
      //Overwrite Array index
      todolist[index] = newItem;
      res.send("Updated<br /> " + todolist);
    }
  } else {
    res.send('Data Error!');
  }

});
app.get('/newversion', function(req, res) {
  //Update
  request('http://entwicklung.intern.labcode.de/checkapp/3.0/newversion.txt', function(error, response, body) {
    if (!error && response.statusCode == 200) {
      //New Version
      res.send("New Version"); // Show New Version on Page /newversion
    } else {
      //No new Version
      res.send("No New Version"); //Show No New Version on Page /newversion
    }
  });
});
//http.createServer(function(req, res) {
//    res.writeHead(200, {'Content-Type': 'text/plain'});
//    res.write('Hello World from Cloudnode\n\n');
//    res.end();
//s}).listen(app_port);
