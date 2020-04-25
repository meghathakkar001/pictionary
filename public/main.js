var socket = io();
var user;
var prev = {};

function usernameAsk() {
    $('.grey-out').fadeIn(500);
    $('.user').fadeIn(500);
    $('.user').submit(function(){
        event.preventDefault();
        user = $('#username').val().trim();

        if (user == '') {
            return false
        };

        var index = users.indexOf(user);

        if (index > -1) {
            alert(user + ' already exists');
            return false
        };
        
        socket.emit('join', user);
        $('.grey-out').fadeOut(300);
        $('.user').fadeOut(300);
        $('input.guess-input').focus();
    });
};

var context;
var canvas;
var click = false;

var clearScreen = function() {
    prev = {};
    context.clearRect(0, 0, canvas[0].width, canvas[0].height);
	context.beginPath();
};

var guesser = function() {
    clearScreen();
    click = false;
    console.log('draw status: ' + click);
    $('.draw').hide();
    $('#guesses').empty();
    console.log('You are a guesser');
    $('#guess').show();
    $('.guess-input').focus();

    $('#guess').on('submit', function() {
        event.preventDefault();
        var guess = $('.guess-input').val();

        if (guess == '') {
            return false
        };

        console.log(user + "'s guess: " + guess);
        socket.emit('guessword', {username: user, guessword: guess});
        $('.guess-input').val('');
    });
};

var guessword = function(data){
    if($('#guesses').val()!='') {
		$('#guesses').val($('#guesses').val()+'\n'+data.username + "'s guess: " + data.guessword);
	} else {
		$('#guesses').val(data.username + "'s guess: " + data.guessword);
	}

    if (click == true && data.guessword.toString().toLowerCase() == $('span.word').text().toLowerCase() ) {
        console.log('guesser: ' + data.username + ' draw-word: ' + $('span.word').text());
        socket.emit('correct answer', {username: data.username, guessword: data.guessword});
        socket.emit('swap rooms', {from: user, to: data.username});
        click = false;
    }
};

var drawWord = function(word) {
    $('span.word').text(word);
    console.log('Your word to draw is: ' + word);
};

var users = [];

var userlist = function(names) {
    users = names;
    var html = '<p class="chatbox-header">' + 'Players' + '</p>';
    for (var i = 0; i < names.length; i++) {
        html += '<li>' + names[i] + '</li>';
    };
    $('ul').html(html);
};

var newDrawer = function() {
    socket.emit('new drawer', user);
    clearScreen();
    $('#guesses').empty();
};

var correctAnswer = function(data) {
    $('#guesses').html('<p>' + data.username + ' guessed correctly!' + '</p>');
};

var reset = function(name) {
    clearScreen();
    $('#guesses').empty();
    console.log('New drawer: ' + name);
    $('#guesses').html('<p>' + name + ' is the new drawer' + '</p>');
};

var draw = function(obj){
	if (prev.x && prev.y) {
			
           drawLine(prev.x, prev.y, obj);
     }
	prev.x=obj.position.x;
	prev.y=obj.position.y;
};

var drawLine = function(fromx, fromy, obj){
	context.beginPath();
	console.log(obj.color);
	context.strokeStyle = obj.color;
		context.moveTo(fromx, fromy);
		context.lineTo(obj.position.x, obj.position.y);
		context.stroke();
};
var stopDraw = function() {
    prev={};
};

var getCanvas = function() {
	console.log("Received getCanvas, returning: "+context);
	socket.emit('send canvas', {'drawerCanvas': document.getElementById('canvas').toDataURL()});
};

var initCanvas = function(obj){
	console.log("Received init canvas" + obj);
    loadCanvas(obj.drawerCanvas);
    socket.emit('leave newguesser');
};

 var loadCanvas = function(dataURL) {
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');

        // load image from data url
        var imageObj = new Image();
        imageObj.onload = function() {
          context.drawImage(this, 0, 0);
        };

        imageObj.src = dataURL;
      };

var pictionary = function() {
    clearScreen();
    click = true;
    console.log('draw status: ' + click);
    $('#guess').hide();
    $('#guesses').empty();
    $('.draw').show();

    var drawing;
    var color;
    var obj = {};
	obj.color="black"

    $('.draw-buttons').on('click', 'button', function(){
        obj.color = $(this).attr('value');
        console.log(obj.color);

        if (obj.color === '0') {
            socket.emit('clear screen', user);
            context.fillStyle = 'white';
            return;
        };
    });

    console.log('You are the drawer');

    $('.users').on('dblclick', 'li', function() {
        if (click == true) {
            var target = $(this).text();
            socket.emit('swap rooms', {from: user, to: target});
        };
    });

    	// Set up touch events for mobile, etc
canvas[0].addEventListener("touchstart", function (e) {
    mousePos = getTouchPos(canvas[0], e);
var touch = e.touches[0];
var mouseEvent = new MouseEvent("mousedown", {
clientX: touch.clientX,
clientY: touch.clientY
});
canvas[0].dispatchEvent(mouseEvent);
}, false);
canvas[0].addEventListener("touchend", function (e) {
var mouseEvent = new MouseEvent("mouseup", {});
canvas[0].dispatchEvent(mouseEvent);
}, false);
canvas[0].addEventListener("touchmove", function (e) {
var touch = e.touches[0];
var mouseEvent = new MouseEvent("mousemove", {
clientX: touch.clientX,
clientY: touch.clientY
});
canvas[0].dispatchEvent(mouseEvent);
}, false);

// Get the position of a touch relative to the canvas[0]
function getTouchPos(canvasDom, touchEvent) {
var rect = canvasDom.getBoundingClientRect();
return {
x: touchEvent.touches[0].clientX - rect.left,
y: touchEvent.touches[0].clientY - rect.top
};
}

document.body.addEventListener("touchstart", function (e) {
if (e.target == canvas[0]) {
e.preventDefault();
}
}, { passive: false });
document.body.addEventListener("touchend", function (e) {
if (e.target == canvas[0]) {
e.preventDefault();
}
}, { passive: false });
document.body.addEventListener("touchmove", function (e) {
if (e.target == canvas[0]) {
e.preventDefault();
}
}, { passive: false });


    canvas.on('mousedown', function(event) { 
        drawing = true;   
        var mousePosition=getMousePos(canvas,event);
		
		if(click==true){
			prev.x=mousePosition.x;
			prev.y=mousePosition.y;
		}
    });
    canvas.on('mouseup', function(event) {
        drawing = false;
        prev={};
		socket.emit("stopDraw");
    });

    getMousePos = function(canvas, evt) {
        var rect = canvas[0].getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        }};

    canvas.on('mousemove', function(event) {
        //var offset = canvas.offset();
        //obj.position = {x: event.pageX - offset.left,
        //                y: event.pageY - offset.top};
        
			
		var mousePosition=getMousePos(canvas,event);
        if (click == true && drawing == true && prev.x && prev.y) {
			obj.position = {x: mousePosition.x,
                        y: mousePosition.y}
			
            drawLine(prev.x, prev.y, obj);
            socket.emit('draw', obj);
			prev.x=mousePosition.x;
			prev.y=mousePosition.y;
			
        }
		
    });

};

$(document).ready(function() {

    canvas = $('#canvas');
    context = canvas[0].getContext('2d');
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;

    usernameAsk();

    socket.on('userlist', userlist);
    socket.on('guesser', guesser);
    socket.on('guessword', guessword);
    socket.on('draw', draw);
    socket.on('stopDraw', stopDraw);
    socket.on('draw word', drawWord);
    socket.on('drawer', pictionary);
    socket.on('new drawer', newDrawer);
    socket.on('correct answer', correctAnswer);
    socket.on('reset', reset);
    socket.on('clear screen', clearScreen);
    socket.on('send canvas', getCanvas);
	socket.on('init canvas', initCanvas);

})
;