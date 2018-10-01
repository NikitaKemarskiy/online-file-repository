// Modules
const express = require('express');
const fs = require('fs');
const http = require('http');
const body_parser = require('body-parser');
const path = require('path');
const hbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

// Configuration
const config = require('./config/config.js');

// Variables
const session_options = {
	name: 'session_id', // name of session id value
	secret: 'fileStorageSecretKey', // secret key for encrypting
	resave: true,
	saveUninitialized: true,
	cookie: {
		path: '/',
		maxAge: 6.048e8, // session expires in a week
		httpOnly: true // cookie isn't visible for client-side javascript
	},
	store: new MongoStore({
      	url: 'mongodb://localhost/file_storage_sessions'
    })
};

// Initialization
const server = express(); // Server
const http_server = http.Server(server); // Socket.io server

// Socket.io
const io = require('./api/functions/sockets.js').listen(http_server);

// Middleware
server.engine('hbs', hbs({ extname: 'hbs' }));
server.set('view engine', 'hbs');
server.set('views', __dirname);

server.use(body_parser.urlencoded({ extended: false })); // Body parser to process post requests
server.use(body_parser.json());
server.use(session(session_options)); // Session

server.use(express.static(path.join(process.cwd(), 'public'))); // Static files

// Routes
const routes = require('./api/routes/routes.js'); // Routing file
server.use('/', routes); // Routing

server.use(function(req, res) { // Ошибка 404

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

