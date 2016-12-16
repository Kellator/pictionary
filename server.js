//boilerplate code to serve static assets and create the Socket.IO engine
var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

//var players = [];
var playerCount = 0;
var playerList = [];


//listen for the draw event and broadcast to all other clients
io.on('connection', function(socket) {
    console.log('player connected');
    var addedPlayer = false;
    //broadcasts message (guess)
    socket.on('message', function(message) {
        io.emit('message', message);
    });
    //add new player name, increases player count, and broadcasts informatino to client.
    socket.on('addUserName', function(user) {
        //players[user] = user;
        ++playerCount;
        addedPlayer = true;
        playerList.push(user);
        socket.userName =user;
        //console.log(playerList);

        io.emit('login', {
            user: user,
            playerCount: playerCount,
        });
    });
    //broadcasts who is drawing to players
    socket.on('pen claimed', function() {
        console.log('pen claimed');
        var isDrawer = true;
        io.emit('pen claimed', {
            user: socket.userName,
    });
    });
    //broadcasts drawing to clients
    socket.on('draw', function(position) {
        io.emit('draw', position);
    });
    //
//shows user who is currently guessing

    socket.on('typing', function() {
        socket.broadcast.emit('typing', {
            user: socket.userName,
    });
    });
    socket.on('disconnect', function() {
        // if (addedPlayer) {
            --playerCount;
            console.log('player list:  ' + playerList);
            var i = playerList.indexOf(socket.userName);
            playerList.splice(i, 1);
            console.log('var i  : ' + i);
            // delete playerList[socket.userName];
            console.log(playerList + ' playerList');
            // playerList.remove(user); 
            // var playerToRemove = playerList.indexOf(user);
            // playerList.splice(playerToRemove, 1);
            // console.log(playerCount);
            // console.log(playerToRemove);
        //}
        socket.broadcast.emit('playerDisconnect', {
            user: socket.userName,
            playerCount: playerCount
        });
        console.log('disconnect: ', socket.userName);
    });
});

server.listen(process.env.PORT || 8080);