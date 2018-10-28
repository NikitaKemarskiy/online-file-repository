// Socket constructor
const socket = function(io, storage) {

	// Functions
	this.connection = function(socket) {

		// Log to see a new user connected
		console.log(`User was connected -> ${socket.id}`);

		socket.on('show_directory', function(data) { // Show directory event handler

			// Getting files that are in the directory
			storage.show_directory(data.path).then(function(items) { 
				
				// Sending these files to user with show_directory event
				io.sockets.connected[socket.id].emit('show_directory', { items: items }); 
			});
		});
	}
}

// Exports
module.exports = socket;