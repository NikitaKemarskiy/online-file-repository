// Modules
const express = require('express');
const http = require('http');
const body_parser = require('body-parser');
const path = require('path');
const hbs = require('express-handlebars');
const session = require('express-session');
const socket_io = require('socket.io');
const MongoStore = require('connect-mongo')(session);

// Configuration
const config = require('./config/config.js');
config.session = {
	name: 'session_id', // Name of session id value
	secret: 'fileStorageSecretKey', // Secret key for encrypting
	resave: true,
	saveUninitialized: true,
	cookie: {
		path: '/',
		maxAge: 6.048e8, // Session expires in a week
		httpOnly: true // Cookie isn't visible for client-side javascript
	},
	store: new MongoStore({
      	url: 'mongodb://localhost/file_storage_sessions'
    })
};

// Variables

// Initialization
const server = express(); // Server
const http_server = http.Server(server); // Socket.io server
const io = socket_io.listen(http_server);

// Middleware
server.engine('hbs', hbs({ extname: 'hbs' }));
server.set('view engine', 'hbs');
server.set('views', __dirname);

server.use(body_parser.urlencoded({ extended: false })); // Body parser to process post requests
server.use(body_parser.json());
server.use(session(config.session)); // Session

server.use(express.static(path.join(process.cwd(), 'public'))); // Static files

// Routes
const routes = require('./api/routes/routes.js')(io); // Routing file (as an argument we pass socket.io object to use it inside)
server.use('/', routes); // Routing

server.use(function(req, res) { // Error 404

  	res.status(404).send("Error 404: page not found");
});

// Express.js
http_server.listen(config.server.port, config.server.host, function(error) {
	if (error) {
		console.error(`Server error: ${error.message}`);
	} else {
		console.log(`Server is listening at ${config.server.host}:${config.server.port}`);
	}
});



