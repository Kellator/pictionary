//boilerplate code to serve static assets and create the Socket.IO engine
var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

//listen for the draw event and broadcast to all other clients
io.on('connection', function(socket) {
    console.log('And we are on');
    socket.on('draw', function(position) {
        socket.broadcast.emit('draw', position);
    });
    });

server.listen(process.env.PORT || 8080);
