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
    console.log('player connected', socket.id);
    var addedPlayer = false;
    socket.on('addPlayer', function(user) {
        console.log(user);
        socket.nickName = player;
        players[player] = player;
        ++playerCount;
        addedPlayer = true;
        console.log(playerCount);
        socket.broadcast.emit('login', {
            user: player,
            playerCount: playerCount
        });
    });    
    socket.on('draw', function(position) {
        io.emit('draw', position);
    });

//shows user who is currently guessing
    socket.on('guessing', function() {
        socket.broadcast.emit('guessing', {
            user: socket.nickName
        });
    });

    socket.on('guess', function(guess) {
        io.emit('guess', guess);
        console.log(guess);
    });
    socket.on*'typing', function() {
        socket.broadcast.emit('typing', {
            user: socket.nickName,
        })
    }
    socket.on('disconnect', function() {
        console.log('player disconnected2');
        if (addedPlayer) {
            delete players[socket.nickName];
            --playerCount;
        }
        socket.broadcast.emit('playerDisconnect', {
            player: socket.nickName,
            playerCount: playerCount
        });
        console.log('disconnect: ', socket.nickName);
    });
});

server.listen(process.env.PORT || 8080);
