/**
 * Created by aidanoleary on 11/08/2016.
 */
var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var ip = "";

app.get('/', function (req, res) {

    res.sendFile(__dirname + '/index.html', {}, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        }
        else {
            console.log("someone has joined from: " + req.ip);
        }
    });

});

var userOperations = function() {
  var connectedUsers = [];

  userObj = {};
  userObj.addUserToConnectedUsers = function(username) {
      connectedUsers.push(username);
  };  

  userObj.removeUser = function(username) {
    var index = connectedUsers.indexOf(username);
    connectedUsers.splice(index, 1);
  }

  userObj.generateUsername = function() {
      var username = "guest";
      for(var i = 0; i < 5; i++) {
        username += (Math.floor((Math.random() * 10)));
      }
      return username;
  };

  userObj.getUserList = function() {
    return connectedUsers;
  }

  return userObj;

}();


io.on("connection", function (socket) {
    console.log("a user connected");

    var username = userOperations.generateUsername();
    userOperations.addUserToConnectedUsers(username);

    //socket.broadcast.emit('user entered', username);
    socket.emit('initialise', initialise());
    socket.on("disconnect", function () {
        userOperations.removeUser(username);
        // TODO Add code to remove the user from the connected users list.
        console.log("a user disconnected");
        io.emit('user left', username);
    });

    socket.on('user connected', function(username) {
      socket.broadcast.emit('user entered', username);
    });


    socket.on('chat message', function(msg) {
        console.log('message: ' + ip + " " + msg);
        socket.broadcast.emit('chat message', msg);
    });


});

var initialise = function() {

  return function() {
    var initObj = {};
    initObj.username = userOperations.generateUsername();
    userOperations.addUserToConnectedUsers(initObj.username);
    initObj.connectedUsers = userOperations.getUserList();

    return initObj;
  };
}();


http.listen(3000, function () {
    console.log('listening on port: 3000');
});
