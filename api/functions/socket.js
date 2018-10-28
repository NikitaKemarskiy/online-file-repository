// Modules
const path = require('path');

// Constants
const STORAGE_PATH = path.join(process.cwd(), 'storage', 'users'); // Constant value for storage folder

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

		socket.on('delete_items', function(data) { // Delete items event handler

			// Parsing JSON string with items into array
			data.items = JSON.parse(data.items);

			// Variables
			let items_path = path.join(STORAGE_PATH, data.email, data.path);
		
			storage.delete_items(items_path, data.items).then(function(result) { // Deleting items
				
				io.sockets.connected[socket.id].emit('items_deleted', {}); // Emitting socket event
			});
		});
	}
}

// Exports
module.exports = socket;