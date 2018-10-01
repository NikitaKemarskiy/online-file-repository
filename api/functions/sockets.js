// Modules
const socket_io = require('socket.io');

// Functions
const listen = function(server) {

	io = socket_io.listen(server); // Listen for events

	io.on('connection', function(socket) { // Connection handler

		console.log(`User was connected -> ${socket.id}`);
	});
}

// Exports
module.exports.listen = listen;