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
            //emit a draw event from here - should contain position as data
            socket.emit('draw', position)
            draw(position);
            socket.on('draw', function(position) {
            draw(position);
        });
        };
    });
};

$(document).ready(function() {
    pictionary();
});
//call draw function when broadcast for draw event is received