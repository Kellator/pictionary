//boilerplate code to serve static assets and create the Socket.IO engine
var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var players = [];
var playerCount = 0;


//listen for the draw event and broadcast to all other clients
io.on('connection', function(socket) {
    console.log('player connected');
    var addedPlayer = false;
    console.log(players);
    //broadcasts message (guess)
    socket.on('message', function(message) {
        io.emit('message', message);
    });
    //add new player name, increases player count, and broadcasts informatino to client.
    socket.on('addUserName', function(user) {
        players[user] = user;
        ++playerCount;
        addedPlayer = true;

        io.emit('login', {
            user: user,
            playerCount: playerCount,
        });
    });
    //broadcasts who is drawing to players
    socket.on('pen claimed', function(user) {
        socket.broadcast.emit('pen claimed', user);
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
        if (addedPlayer) {
            console.log(playerCount);
            --playerCount;
            console.log(playerCount);
        }
        io.emit('playerDisconnect', {
            user: socket.userName,
            playerCount: playerCount
        });
        console.log('disconnect: ', socket.userName);
        console.log("disconnect players list: " + players );
    });
});

server.listen(process.env.PORT || 8080);