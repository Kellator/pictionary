//boilerplate code to serve static assets and create the Socket.IO engine
var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var players = {};
var playerCount = 0;

//listen for the draw event and broadcast to all other clients
io.on('connection', function(socket) {
    console.log('player connected');
    var addedPlayer = false;
    socket.on('message', function(message) {
        io.emit('message', message);
        console.log('socket.on 1 ' + message);
    });
    socket.on('addUserName', function(user) {
        console.log('console.log addPlayer');
        players[user] = user;
        console.log(user + 'player here');
        ++playerCount;
        addedPlayer = true;
        console.log(playerCount);
        socket.broadcast.emit('login', {
            user: user,
            playerCount: playerCount
        });
    });    
    socket.on('draw', function(position) {
        io.emit('draw', position);
    });

//shows user who is currently guessing

    socket.on('typing', function() {
        socket.broadcast.emit('typing', {
            user: socket.userName,
    });
    });
    socket.on('disconnect', function() {
        console.log('player disconnected2');
        if (addedPlayer) {
            delete players[socket.nickName];
            --playerCount;
        }
        socket.broadcast.emit('playerDisconnect', {
            user: socket.nickName,
            playerCount: playerCount
        });
        console.log('disconnect: ', socket.nickName);
    });
});

server.listen(process.env.PORT || 8080);