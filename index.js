// Modules
const express = require('express');
const http = require('http');
const body_parser = require('body-parser');
const path = require('path');
const hbs = require('express-handlebars');
const session = require('express-session');
const socket_io = require('socket.io');

// Configuration
const config_constructor = require('./config/config.js'); // We use constructor to pass session module
const config = new config_constructor(session);

// Initialization
const server = express(); // Server
const http_server = http.Server(server); // Socket.io server
const io = socket_io.listen(http_server);

// Middleware
server.engine('hbs', hbs({ extname: 'hbs' })); // Templating ("Handlebars") 
server.set('view engine', 'hbs');
server.set('views', __dirname);
server.use(body_parser.urlencoded({ extended: true })); // Body parser to process post requests
server.use(body_parser.json());
server.use(session(config.session)); // Session

server.use(express.static(path.join(process.cwd(), 'public'))); // Static files

// Routes
const routes = require('./api/routes/routes.js')(io, config); // Routing file (as an argument we pass socket.io object to use it inside)
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
