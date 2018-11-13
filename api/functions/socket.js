// Modules
const path = require('path');

// Constants
const STORAGE_PATH = path.join(process.cwd(), 'storage', 'users'); // Constant value for storage folder

// Socket constructor
const socket = function(io, storage, database) {

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

		socket.on('create_folder', function(data) {
			
			let folder_path = path.join(STORAGE_PATH, data.email, data.path, data.folder_name);
			
			storage.create_directory(folder_path).then(function() {
				io.sockets.connected[socket.id].emit('folder_created', {}); // Emitting socket event
			}).catch(function(error) {
				console.error(`Error: ${error.message}`);
			});
		});

		socket.on('delete_items', function(data) { // Delete items event handler
			// Parsing JSON string with items into array
			data.items = JSON.parse(data.items);

			// Variables
			let items_path = path.join(STORAGE_PATH, data.email, data.path);
		
			storage.delete_items(items_path, data.items).then(function(result) { // Deleting items
				
				io.sockets.connected[socket.id].emit('items_deleted', {}); // Emitting items deleted socket event
			});
		});

		socket.on('get_item_data', function(email) {
			database.get_item_data(email).then(function(data) {
				io.sockets.connected[socket.id].emit('item_data', data); // Emitting socket event
			});
		});
	}
}

// Exports
module.exports = socket;