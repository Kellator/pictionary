var pictionary = function() {
    // var input = $('input');
   // var canvas, context;
   	var canvas = $('#canvas');
	var context = canvas[0].getContext('2d');
    var socket = io();

    var $userNameInput = $('.userName');
    var userName;
    var input = $('input');
    
    var guessBox;
    var guessDisplay = $('#guess_display');
    
    var playerDisplay = $('#player_display');
   
    var words = [
        'dragon', 'phoenix', 'chimera', 'banshee', 'black dog', 'kitsune', 'ogre', 'wyvern', 'giant', 'elf', 'fairy', 'gnome',
        'beholder', 'soot sprite', 'kelpie', 'selkie', 'naga', 'mermaid', 'unicorn', 'gorgon', 'sphinx', 'centaur', 'cyclops', 'ghost', 'griffin', 
        'minotaur', 'satyr', 'valkyrie', 'vampire', 'werewolf', 'zombie'];
        
    var currentWordIndex = 0;
    var wordDisplay = $('.picture');
    
    var drawing = false;
    var isDrawer = false;

    var word;
    canvas[0].width = canvas[0].offsetWidth;
	canvas[0].height = canvas[0].offsetHeight;

    //tells context that new object will start being drawn (makes the drawing utensil on the board)  
    var draw = function(position) {
        context.beginPath();
        context.arc(position.x, position.y, 6, 0, 2 * Math.PI);
        context.fill();
    };
    //clear canvas
    var clearCanvas = function(position) {
        context.clearRect(0, 0, canvas[0].width, canvas[0].height);
    };
    //function to choose current word using random number generation
    var randomWordGenerator = function() {
        currentWordIndex = Math.floor(Math.random() * words.length);
        console.log(currentWordIndex);
        console.log(words[currentWordIndex]);
        word = words[currentWordIndex];
    };
    //randomWordGenerator();
    //console.log(word);
    
    //hides main game screen until user nick name is entered    
    $(function() {
        $('#main').hide();
    });  

    var addMessage = function(data) {
        console.log(data);
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
        }
    };
    //displays word to draw to the player who is drawing
    var displayWord = function() {
        isDrawer = true;
        randomWordGenerator();
        $('#word').text('You are the drawer!  Draw a ' + word + '.');
        $('#guess').hide;
    }

    input.on('keydown', function(event) {
        if (event.keyCode != 13) {
            return;
        }
        if (userName) {
            var guess = guessBox.val();
            var user = userName;
            addMessage({guess: guess, user: userName});
            socket.emit('message', {guess: guess, user: userName});
            guessBox.val('');
            console.log('guess: ' + guess);
        } else {
            setUserName();
        }
    });
    //event buttons for restart game, wipe drawing board, 
    // $('#clear').on('click', clearCanvas);
    $('#clear').on('click', function(event) {
        socket.emit('canvas cleared');
    });
    $('#claim').on('click', function(event) {
        socket.emit('pen claimed');
    });

    guessBox = $('#guess input');
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
            if (isDrawer) {
                socket.emit('draw', position);
                draw(position);
            }
        }
    });

    socket.on('draw', function(position) {
        draw(position);
    });
    //hides the button that allows player to be the drawer
    socket.on('pen claimed', function(data) {
        $('#claim').hide();
        if (isDrawer == false) {
            $('#clear').hide();
        }
        var msg = ('<br>' + data.user + ' has claimed the pen and is the drawer.');
        playerDisplay.append(msg);
    });
    //when option is still available to be the drawer, shows the button that allows player to choose to be drawer and hides the guess section
    socket.on('pen open', function() {
        $('#claim').show();
        $('#guess').hide();
    });
    socket.on('canvas cleared', clearCanvas);
    socket.on('drawer', displayWord);
    //broadcasts user's guess to all clients 
    socket.on('message', function(data) {
        var displayMessage = ('<div>' + data.user + ': ' + data.guess + '</div>');
        guessDisplay.append(displayMessage);
    });
    socket.on('login', function(data) {
        var msg = ('<br>' + data.user + ' is connected.</small><br />  There are ' + data.playerCount + ' players currently connected.');
        console.log('in login:', data);
        playerDisplay.append(msg);
    });
    socket.on('playerDisconnect', function(data) {
        var msg = ('<br>' + data.user + ' has disconnected.</small><br />  There are now ' + data.playerCount + ' players currently connected.');
        playerDisplay.append(msg);
    });
};

$(document).ready(function() {
    pictionary();
});