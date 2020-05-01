var socket = io();
var user;
var prev = {};

function usernameAsk() {
    $('.grey-out').fadeIn(500);
    $('.user').fadeIn(500);
    $('.user').submit(function () {
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

var clearScreen = function () {
    prev = {};
    context.clearRect(0, 0, canvas[0].width, canvas[0].height);
    context.beginPath();
};

var guesser = function () {
    clearScreen();
    click = false;
    console.log('draw status: ' + click);
    $('.draw').hide();
    //$('#guesses').empty();
    console.log('You are a guesser');
    $('#guess').show();
    $('.guess-input').focus();

    $('#guess').on('submit', function () {
        event.preventDefault();
        var guess = $('.guess-input').val();

        if (guess == '') {
            return false
        };

        console.log(user + "'s guess: " + guess);
        socket.emit('guessword', { username: user, guessword: guess });
        $('.guess-input').val('');
    });
};

var guessword = function (data) {
    $('#guesses').html($('#guesses').html() + '<p><b>' + data.username + "'s guess:</b> " + data.guessword);

    var container = $('#guesses')[0];
    var containerHeight = container.clientHeight;
    var contentHeight = container.scrollHeight;
    container.scrollTop = contentHeight - containerHeight;


};

var drawWord = function (word) {
    $('span.word').text(word);
    console.log('Your word to draw is: ' + word);
};

var users = [];

var userlist = function (names) {
    users = [];
    var html = '<p class="chatbox-header">' + 'Players' + '</p>';
    for (var i = 0; i < names.length; i++) {
        users.push(names[i].name)
        html += '<li id="' + names[i].name + '">' + names[i].name + ':' + names[i].score + '</li>';
    };
    $('ul').html(html);
};


var correctAnswer = function (data) {


    $('#guesses').html($('#guesses').html() + '<p style="color:blue;"><b>' + data.username + ' guessed correctly! +' + data.increment + '</b></p>');

    $('#' + data.username).html(data.username + ':' + data.score);
    var container = $('#guesses')[0];
    var containerHeight = container.clientHeight;
    var contentHeight = container.scrollHeight;
    container.scrollTop = contentHeight - containerHeight;
};


var draw = function (obj) {
    if (prev.x && prev.y) {

        drawLine(prev.x, prev.y, obj);
    }
    prev.x = obj.position.x;
    prev.y = obj.position.y;
};

var drawLine = function (fromx, fromy, obj) {
    context.beginPath();

    console.log(obj.color);
    context.strokeStyle = obj.color;
    context.moveTo(fromx, fromy);
    context.lineTo(obj.position.x, obj.position.y);
    context.stroke();
};
var stopDraw = function () {
    prev = {};
};

var whoisdrawing = function (name) {
    $('span.drawername').text(name);
    $('#guesses').html($('#guesses').html() + '<p>' + name + ' is the new drawer' + '</p>');
}

var getCanvas = function () {
    console.log("Received getCanvas, returning: " + context);
    socket.emit('send canvas', { 'drawerCanvas': document.getElementById('canvas').toDataURL() });
};

var initCanvas = function (obj) {
    console.log("Received init canvas" + obj);
    loadCanvas(obj.drawerCanvas);
    socket.emit('leave newguesser');
};

var loadCanvas = function (dataURL) {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    // load image from data url
    var imageObj = new Image();
    imageObj.onload = function () {
        context.drawImage(this, 0, 0);
    };

    imageObj.src = dataURL;
};

var pictionary = function (name) {
    clearScreen();
    click = true;
    console.log('draw status: ' + click);
    $('#guess').hide();
    //$('#guesses').empty();
    $('.draw').show();

    var drawing;
    var color;
    var obj = {};
    obj.color = "black"
    //$('#guesses').html($('#guesses').html() + '<p>' + name + ' is the new drawer' + '</p>');

    $('.draw-buttons').on('click', 'button', function () {
        //obj.color = $(this).attr('value');
        //console.log$('#colorPicker');

        if (click === true) {
            socket.emit('clear screen', user);
            context.fillStyle = 'white';
            return;
        };
    });



    console.log('You are the drawer');


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


    canvas.on('mousedown', function (event) {
        drawing = true;
        var mousePosition = getMousePos(canvas, event);

        if (click == true) {
            prev.x = mousePosition.x;
            prev.y = mousePosition.y;
        }
    });
    canvas.on('mouseup', function (event) {
        drawing = false;
        prev = {};
        socket.emit("stopDraw");
    });

    getMousePos = function (canvas, evt) {
        var rect = canvas[0].getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        }
    };

    var lastEmit = $.now();
    canvas.on('mousemove', function (event) {
        //var offset = canvas.offset();
        //obj.position = {x: event.pageX - offset.left,
        //                y: event.pageY - offset.top};


        var mousePosition = getMousePos(canvas, event);
        if (click == true && drawing == true && prev.x && prev.y && ($.now() - lastEmit) > 100) {
            obj.position = {
                x: mousePosition.x,
                y: mousePosition.y
            }
            obj.color = $('#colorPicker')[0].value;

            drawLine(prev.x, prev.y, obj);
            socket.emit('draw', obj);
            prev.x = mousePosition.x;
            prev.y = mousePosition.y;

        }

    });

};

$(document).ready(function () {

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
    socket.on('correct answer', correctAnswer);
    socket.on('clear screen', clearScreen);
    socket.on('send canvas', getCanvas);
    socket.on('init canvas', initCanvas);
    socket.on('whoisdrawing', whoisdrawing);
    socket.on('timer', function (data) {
        $('#counter').html(data.countdown);
    });


})
    ;