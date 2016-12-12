var pictionary = function() {
    // var input = $('input');
    var canvas, context;
    var socket = io();
    var drawing = false;
    
    var $userNameInput = $('.userName');
    var userName;
    var nameBox;
    var input = $('input');
    
    var guessBox;
    var guessDisplay = $('#guess_display');
   
    var words = [
        'dragon', 'phoenix', 'chimera', 'banshee', 'black dog', 'kitsune', 'ogre', 'wyvern', 'giant', 'elf', 'fairy', 'gnome',
        'beholder', 'soot sprite', 'kelpie', 'selkie', 'naga', 'mermaid', 'unicorn', 'gorgon', 'sphinx', 'centaur', 'cyclops', 'ghost', 'griffin', 
        'minotaur', 'satyr', 'valkyrie', 'vampire', 'werewolf', 'zombie'];
        
    var currentWordIndex = 0;
    var wordDisplay = $('.picture');
    
    var isDrawer = false;

    //tells context that new object will start being drawn (makes the drawing utensil on the board)  
    var draw = function(position) {
        context.beginPath();
        context.arc(position.x, position.y, 6, 0, 2 * Math.PI);
        context.fill();
    };
    //function to choose current word using random number generation
    var randomWordGenerator = function() {
        currentWordIndex = Math.floor(Math.random() * words.length);
        console.log(currentWordIndex);
        console.log(words[currentWordIndex]);
        var display = ('<div>Your mythical creature to draw is: ' + words[currentWordIndex] + '.</div>');
        wordDisplay.append(display);
    };
    randomWordGenerator();
    
    //hides main game screen until user nick name is entered    
    $(function() {
        $('#main').hide();
    });   
    var addMessage = function(data) {
        console.log(data);
        // guessDisplay.append('<div>' + data.user + ': ' + data.message + '</div>');
    };
    //shows game page after user nick name entered, sets user's nickname to be used in chat/guessing
    var setUserName = function() {
        userName = $userNameInput.val().trim();
        console.log('user is ' + userName);
        if (userName) {
            $('#welcome_page').hide();
            $('#main').show();
            $('#welcome_page').off('click');
            socket.emit('addUserName', userName);
            // console.log(nickName + ' hi');
        }
    };
    input.on('keydown', function(event) {
        if (event.keyCode != 13) {
            return;
        }
        if (userName) {
            var message = guessBox.val();
            var user = userName
            addMessage({message: message, user: userName});
            socket.emit('message', {message: message, user: userName});
            socket.emit('user', user);
            guessBox.val('');
            console.log(message);
        } else {
            setUserName();
        };
    })
    
    //function to compare answer with guess - if message === guess display winner! (change to all lowercase)
    
    //event buttons for restart game, wipe drawing board, 
    
    //show drawing option only to drawer (if isDrawer == true (randomWordGenerator())
    
// //listens for the keypresses in the input, emits user guess event to the server 
//     var onKeyDown = function(event) {
//         if (event.keyCode != 13) {
//             return;
//         }
//         // console.log(guessBox.val());
//         var guess = guessBox.val();
//         socket.emit('guess', guess);
//         guessBox.val('');
//     };
     guessBox = $('#guess input');
//     guessBox.on('keydown', onKeyDown);
    
    //selects the canvas element and allows user to create a drawing context    
    canvas = $('canvas');
    context = canvas[0].getContext('2d');
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;
    canvas.on('mousedown', function(event) {
        drawing = true;
    });
    canvas.on('mouseup', function(event) {
        drawing = false;
    });
    canvas.on('mousemove', function(event) {
        if (drawing === true) {
            var offset = canvas.offset();
            var position = {x: event.pageX - offset.left,
                            y: event.pageY - offset.top};
            socket.emit('draw', position);
            draw(position);
        };
    });
    socket.on('draw', function(position) {
        draw(position);
    });
    //broadcasts user's guess to all clients 
    socket.on('message', function(data) {
        console.log(data + ' message');
        var displayMessage = ('<div>' + data.user + ': ' + data.message + '</div>');
        guessDisplay.append(displayMessage);
        console.log('i am the display message ' +displayMessage);
    });
    socket.on('login', function(data) {
        var msg = ('<br>' + data.user + ' has connected.</small><br />  There are ' + data.playerCount + ' players currently connected.');
        console.log('in login:', data);
        guessDisplay.append(msg);
    });
    // socket.on('picture', function() {
    //     var display = ('<div>Your word to draw is ' + words[currentWordIndex] + '.</div>');
    //     wordDisplay.append(display);
    // });
};

$(document).ready(function() {
    pictionary();
});