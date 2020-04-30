var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var users = [];
var currentWord;
var game = initGame();

function initGame(drawerName) {

	var drawer = drawerName;
	var currentGuessers = [];
	let usersAlreadyDrawn = [];
	{
		for (var i = 0; i < users.length; i++) {
			users[i].score = 0;
			if (!username === drawerName) {
				currentGuessers.push(user.name);
			}

		};
	}
	addDrawer = function (drawerName) {
		console.log("addDrawer called with: %s", drawerName);
		drawer = drawerName;
		usersAlreadyDrawn.push(drawerName);
	}
	nextDrawer = function () {
		let drawerName = null;
		console.log('Selecting next user from: ' + JSON.stringify(users, null, 2));
		console.log('Already drawn: ' + JSON.stringify(usersAlreadyDrawn, null, 2));
		for (var i = 0; i < users.length; i++) {
			let select = true;
			console.log("Trying out user: " + users[i].name);
			for (var j = 0; j < usersAlreadyDrawn.length; j++) {
				console.log('comparing users i %j %j j %j %j', i, users[i].name, j, usersAlreadyDrawn[j]);
				if (usersAlreadyDrawn[j] === users[i].name) {
					console.log("Found user " + users[i].name);
					select = false;
					break;
				}
			}
			if (select) {
				drawerName = users[i].name;
				break;
			}
		}
		drawer = drawerName;
		console.log("Final drawer: " + drawerName);
		updateGuessers();
		return drawerName;
	}
	getGuessers= function(){
		return currentGuessers;
	}

	guessedCorrectly = function (username) {
		console.log("%s guessed from current guessers: %s",username, JSON.stringify(getGuessers(),null,2));
		for (var j = 0; j < currentGuessers.length; j++) {
			if (currentGuessers[j] === username) {
				currentGuessers.splice(j, 1);
				break;
			}
		}
		if (currentGuessers.length == 0) {
			return true;
		}
		return false;

	}

	updateGuessers = function () {
		{
			console.log('updateGuessers called with drawers %s and usernames: ',drawer,JSON.stringify(users));
			currentGuessers.splice(0,currentGuessers.length);
			for (var i = 0; i < users.length; i++) {
				console.log('comparing %s with %s', users[i].name, drawer);
				if (!(users[i].name === drawer)) {
					currentGuessers.push(users[i].name);
				}

			};
			console.log('updateGuessers finished, object is: %s',JSON.stringify(currentGuessers,null,2));
		}
    }
    getDrawer = function(){
        return drawer;
    }
	return {
		usersAlreadyDrawn: usersAlreadyDrawn,
		currentGuessers: currentGuessers,
		addDrawer: addDrawer,
		nextDrawer: nextDrawer,
		guessedCorrectly: guessedCorrectly,
		updateGuessers: updateGuessers,
		getDrawer: getDrawer
	}


}


var words = [
	"word", "letter", "number", "person", "pen", "police", "people",
	"sound", "water", "breakfast", "place", "man", "men", "woman", "women", "boy",
	"girl", "serial killer", "Oregon Trail", "week", "month", "name", "sentence", "line", "air",
	"land", "home", "hand", "house", "picture", "animal", "mother", "father",
	"big foot", "sister", "world", "head", "page", "country", "question",
	"shiba inu", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
	"farm", "story", "sea", "night", "day", "life", "north", "south", "east",
	"west", "child", "children", "example", "paper", "music", "river", "car", "feet", "book", "science", "room", "friend", "idea", "fish",
	"mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
	"body", "fart", "family", "song", "door", "forest", "wind", "ship", "area",
	"rock", "Captain Planet", "fire", "problem", "airplane", "top", "bottom", "king",
	"space", "whale", "unicorn", "narwhal", "furniture", "sunset", "sunburn", "feather", "pigeon",
	"Angel", "Eyeball", "Pizza", "Angry", "Fireworks", "Pumpkin", "Baby", "Flower", "Rainbow", "Beard", "Flying saucer", "Recycle", "Bible", "Giraffe", "Sand castle", "Bikini", "Glasses", "Snowflake", "Book", "High heel", "Stairs", "Bucket", "Ice cream cone", "Starfish", "Bumble bee", "Igloo", "Strawberry", "Butterfly", "Lady bug", "Sun", "Camera", "Lamp", "Tire", "Cat", "Lion", "Toast", "Church", "Mailbox", "Toothbrush", "Crayon", "Night", "Toothpaste", "Dolphin", "Nose", "Truck", "Egg", "Olympics", "Volleyball", "Eiffel Tower", "Peanut"
];

function newWord() {
	wordcount = Math.floor(Math.random() * (words.length));
	currentWord = words[wordcount];
	return currentWord;
};

var wordcount;
var whoisdrawing;
io.on('connection', function (socket) {

	io.emit('userlist', users);

	socket.on('join', function (name) {
		socket.username = name;

		// user automatically joins a room under their own name
		socket.join(name);
		console.log(socket.username + ' has joined. ID: ' + socket.id);

		// save the name of the user to an array called users
		users.push({ name: socket.username, score: 0 });


		// if the user is first to join OR 'drawer' room has no connections
		if (users.length == 1 || typeof io.sockets.adapter.rooms['drawer'] === 'undefined') {

			// place user into 'drawer' room
			socket.join('drawer');
			game.addDrawer(socket.username);
			console.log('Drawer is '+game.getDrawer());

			// server submits the 'drawer' event to this user
			io.in(socket.username).emit('drawer', socket.username);
			console.log(socket.username + ' is a drawer');

			// send the random word to the user inside the 'drawer' room
			io.in(socket.username).emit('draw word', newWord());
			//	console.log(socket.username + "'s draw word (join event): " + newWord());
			whoisdrawing = name;
		}

		// if there are more than one names in users 
		// or there is a person in drawer room..
		else {

			// additional users will join the 'guesser' room
			socket.join('guesser');
			socket.join('new guesser');
			game.updateGuessers();


			console.log("sending request to send canvas");

			io.in('drawer').emit('send canvas');

			// server submits the 'guesser' event to this user
			io.in(socket.username).emit('guesser', socket.username);
			console.log(socket.username + ' is a guesser');
		}

		// update all clients with the list of users
		io.emit('userlist', users);
		io.emit('whoisdrawing', whoisdrawing);

	});

	// submit drawing on canvas to other clients
	socket.on('draw', function (obj) {
		socket.broadcast.emit('draw', obj);
	});

	// submit drawing on canvas to other clients
	socket.in('drawer').on('send canvas', function (obj) {
		console.log('Canvas received:');
		io.in('new guesser').emit('init canvas', obj);
	});

	//once first time canvas is loaded leave the new guesser group
	socket.on('leave newguesser', function () {
		socket.leave('new guesser');
	});

	// submit drawing on canvas to other clients
	socket.on('stopDraw', function (obj) {
		console.log('stop draw received and now emiting to all')
		socket.broadcast.emit('stopDraw');
	});

	// submit each client's guesses to all clients
	socket.on('guessword', function (data) {
		var guessToPrint = data.guessword;
		console.log('guessword event triggered on server from: ' + data.username + ' with word: ' + data.guessword);

		if (currentWord.toString().toLowerCase() === data.guessword.toString().toLowerCase()) {
			console.log('guesser: ' + data.username + ' draw-word: ' + data.guessword.toString());
			io.emit('correct answer', { username: data.username });

			let everyoneGuessed = game.guessedCorrectly(data.username);
			console.log('Drawer is '+game.getDrawer());

			if (everyoneGuessed) {

				swapRooms({ from: game.getDrawer(), to: game.nextDrawer() });
			}

			//socket.emit('swap rooms', {from: user, to: data.username});
		} else {

			io.emit('guessword', { username: data.username, guessword: guessToPrint })
		}
	});

	socket.on('disconnect', function () {
		for (var i = 0; i < users.length; i++) {

			// remove user from users list
			if (users[i].name == socket.username) {
				users.splice(i, 1);
				game.updateGuessers();
			};
		};
		console.log(socket.username + ' has disconnected.');

		// submit updated users list to all clients
		io.emit('userlist', users);

		var room = io.sockets.adapter.rooms['drawer'];
		// if 'drawer' room has no connections..


		console.log(socket.username + ' has disconnected. Drawer Room is' + room);

		if (!(typeof io.sockets.adapter.rooms['drawer'] === 'undefined')) {
			console.log('drawer room size is: ' + room.length);
		}

		if (typeof io.sockets.adapter.rooms['drawer'] === 'undefined' || room.length === 0) {

			// generate random number based on length of users list

			let nextDrawer = game.nextDrawer();
			// submit new drawer event to the random user in userslist
			io.in(nextDrawer).emit('new drawer', nextDrawer);
		};
	});

	socket.on('new drawer', function (name) {

		// remove user from 'guesser' room
		socket.leave('guesser');

		// place user into 'drawer' room
		socket.join('drawer');
		game.addDrawer(name);
		console.log('Drawer is '+game.getDrawer());
		console.log('new drawer emit: ' + name);

		// submit 'drawer' event to the same user
		io.in('drawer').emit('drawer', socket.username);
		//socket.emit('drawer', name);

		// send a random word to the user connected to 'drawer' room
		io.in('drawer').emit('draw word', newWord());
		io.emit('whoisdrawing', name);

	});

	// initiated from drawer's 'dblclick' event in Player list
	socket.on('swap rooms', function (data) {

		// drawer leaves 'drawer' room and joins 'guesser' room
		socket.leave('drawer');
		socket.join('guesser');

		// submit 'guesser' event to this user
		io.in(socket.username).emit('guesser', socket.username)
		//socket.emit('guesser', socket.username);

		//submit 'new drawer' to target so that it can be added to drawer room
		io.in(data.to).emit('new drawer', data.to);

		// submit random word to new user drawer
		io.in(data.to).emit('draw word', newWord());

		io.emit('reset', data.to);

	});

	socket.on('clear screen', function (name) {
		io.emit('clear screen', name);
	});

	swapRooms = function (data) {

		// drawer leaves 'drawer' room and joins 'guesser' room
		console.log("swap rooms: from: %s, to: %s", data.from, data.to);
		var socketList = io.sockets.sockets;
		for (var socketId in socketList) {
			var socket = socketList[socketId];
			console.log("Socket is %s", socket.username);
			if(socket.username === data.from){
				socket.leave('drawer');
				socket.join('guesser');
			}
		}

		// submit 'guesser' event to this user
		io.in(data.from).emit('guesser', socket.username)
		//socket.emit('guesser', socket.username);

		//submit 'new drawer' to target so that it can be added to drawer room
		io.in(data.to).emit('new drawer', data.to);

		// submit random word to new user drawer
		io.in(data.to).emit('draw word', newWord());

		io.emit('reset', data.to);

	}

})

server.listen(process.env.PORT || 8080, function () {
	console.log('Server started at http://localhost:8080');
});