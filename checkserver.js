var express = require('express');
var app = express();

var todolist = [
  {
    name:"Bügeln", complete: false,
    name:"Waschen", complete: false
  }
]

app.get('/', function (req, res) {
    res.send(todolist);
  });

app.get('/update', function(req, res) {
  if(req.query.name && req.query.complete) {
    var index = todolist.findIndex(function(item) {
      if (item.name == req.query.name) {
        return true;
      }else{
        return false;
      }
    })

    var newItem = {
    name: req.query.name,
    complete: req.query.complete
    }

    if (index == -1) {
    todolist.push(newItem);
    res.send("Angelegt");
  }else{
    //Overwrite Array index
    todolist[index] = newItem;
    res.send("Updated");
  }


  } else {
    res.send('Error!');
  }

})

var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('CheckServer listening on port ' + port + '!');
});
