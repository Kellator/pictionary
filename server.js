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
    socket.on('draw', function(position) {
        io.emit('draw', position);
    });
//adds player nick name and increases player count
    // socket.on('addPlayer', function(player) {
    //     socket.nickName = player;
    //     players[player] = player;
    //     console.log(player);
    //     ++playerCount;
    //     addedPlayer = true;
    //     socket.broadcast.emit('login', {
    //         player: player,
    //         playerCount: playerCount
    //     });
    // });
//shows user who is currently guessing
    socket.on('guessing', function() {
        socket.broadcast.emit('guessing', {
            player: socket.nickName
        });
    });

    socket.on('guess', function(guess) {
        io.emit('guess', guess);
        console.log(guess);
    });
    socket.on('disconnect', function() {
        console.log('player disconnected');
        // if (addedPlayer) {
        //     delete players[socket.nickName];
        //     --playerCount;
        // }
        // socket.broadcast.emit('playerDisconnect', {
        //     player: socket.nickName,
        //     playerCount: playerCount
        // });
    });
});

server.listen(process.env.PORT || 8080);
