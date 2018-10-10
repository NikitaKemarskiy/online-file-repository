// Modules
const jszip = require('jszip'); // Module to work with archives

// Socket constructor
const socket = function(io, storage) {

	// Functions
	this.connection = function(socket) {

		console.log(`User was connected -> ${socket.id}`);

		socket.on('show_directory', function(data) { // Show directory event handler

			storage.show_directory(data.path).then(function(items) { // Getting files that are in the directory
					
				io.sockets.connected[socket.id].emit('show_directory', { items: items }); // Sending these files to user with show_directory event
			});
		});

		socket.on('zip_files', function(data) {

			// data.path - directory from which user wants to download some files
			// data.items - array with files names
			// data.items.item_name - item name
			// data.items.item_type - item type
			console.dir(data);
		});
	}
}

// Exports
module.exports = socket;