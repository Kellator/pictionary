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

        socket.broadcast.emit('login', {
            user: user,
            playerCount: playerCount,
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
    socket.on('disconnect', function(user) {
        if (addedPlayer) {
            delete players[user];
            --playerCount;
        }
        console.log("disconnect players list: " + players );
        socket.broadcast.emit('playerDisconnect', {
            user: user,
            playerCount: playerCount
        });
        console.log('disconnect: ', user);
    });
});

server.listen(process.env.PORT || 8080);