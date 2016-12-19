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
var word;
var guess;

//listen for the draw event and broadcast to all other clients
io.on('connection', function(socket) {
    console.log('player connected');
    var addedPlayer = false;
    //broadcasts message (guess)
    socket.on('message', function(message) {
        io.emit('message', message);
        guess = message.guess;
        console.log('word: ' + word + ', guess: ' + guess);
        if (word == guess) {
            io.emit('player wins');
            console.log('made it to winner');
        }
    });
    socket.on('word', function(picture) {
        word = picture
        console.log('word:: ' + picture);
    });
    //add new player name, increases player count, and broadcasts informatino to client.
    socket.on('addUserName', function(user) {
        ++playerCount;
        addedPlayer = true;
        playerList.push(user);
        socket.userName = user;

        io.emit('login', {
            user: user,
            playerCount: playerCount,
        });
    });
    //transmits canvas clear command
    socket.on('canvas cleared', function() {
        console.log('canvas has been cleared');
        io.emit('canvas cleared');
    });
    socket.on('new game', function() {
        console.log('a new game has been started');
        io.emit('new game');
    });
    //broadcasts who is drawing to players
    socket.on('pen claimed', function() {
        console.log('pen claimed');
        var isDrawer = true;
        socket.emit('drawer');
        io.emit('pen claimed', {
            user: socket.userName,
        });
    });

    //broadcasts drawing to clients
    socket.on('draw', function(position) {
        io.emit('draw', position);
    });
    //shows user who is currently typing
    // socket.on('typing', function() {
    //     socket.broadcast.emit('typing', {
    //         user: socket.userName,
    //     });
    // });
    //broadcast when user disconnects
    socket.on('disconnect', function() {
        var i = playerList.indexOf(socket.userName);
        if (i != -1) {
            playerList.splice(i, 1);
            --playerCount;
            socket.broadcast.emit('playerDisconnect', {
                user: socket.userName,
                playerCount: playerCount
            });
        }
    });
    
});

server.listen(process.env.PORT || 8080);
