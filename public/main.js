//allows drawing to the canvas
var pictionary = function() {
    var canvas, context;
    var socket = io();
    var drawing = false;
//tells context that new object will start being drawn (makes the drawing utensil on the board)  
    var draw = function(position) {
        context.beginPath();
        context.arc(position.x, position.y, 6, 0, 2 * Math.PI);
        context.fill();
    };
    
    var guessBox;
    var guessDisplay = $('#guess_display');

//listens for the keypresses in the input    
//needs to also EMIT a guess event to the server when a guess is made (should have the word the user guessed as data)
//broadcast a the guess to all of the other clients
    var onKeyDown = function(event) {
        if (event.keyCode != 13) {
            return;
        }
        // console.log(guessBox.val());
        var guess = guessBox.val();
        socket.emit('guess', guess);
        guessBox.val('');
    };
    
    guessBox = $('#guess input');
    guessBox.on('keydown', onKeyDown);
//selects the canvas element and allows user to create a drawing context    
    canvas = $('canvas');
    context = canvas[0].getContext('2d');
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;
    canvas.on('mousedown', function(event) {
        drawing = true;
    })
    canvas.on('mouseup', function(event) {
        drawing = false;
    })
    canvas.on('mousemove', function(event) {
        if (drawing === true) {
            var offset = canvas.offset();
            var position = {x: event.pageX - offset.left,
                            y: event.pageY - offset.top};
            socket.emit('draw', position)
            draw(position);
            socket.on('draw', function(position) {
            draw(position);
        });
        };

    });
    socket.on('guess', function(guess) {
        var displayMessage = ('<div>' + guess + '</div>');
        guessDisplay.append(displayMessage);
        console.log('i am the display message ' +displayMessage);
    });
};

//listen for the guess event - when received update the contents of <div> guess_display to display last guess
$(document).ready(function() {
    pictionary();
});