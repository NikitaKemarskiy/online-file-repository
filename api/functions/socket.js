// Config constructor
const socket = function(io, storage) {

	// Functions
	this.connection = function(socket) {

		console.log(`User was connected -> ${socket.id}`);

		socket.on('show_directory', function(path) { // Show directory event handler

			storage.show_directory(path).then(function(items) { // Getting files that are in the directory
					
				io.sockets.connected[socket.id].emit('show_directory', { items }); // Sending these files to user with show_directory event
			});
		});
	}
}

// Exports
module.exports = socket;