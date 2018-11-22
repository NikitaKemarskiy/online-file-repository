// Modules
const path = require('path');

// Constants
const STORAGE_PATH = path.join(process.cwd(), 'storage', 'users'); // Constant value for storage folder

// Functions
const logging = require(path.join(process.cwd(), 'api', 'functions', 'logging.js')); // Functions for logging in logs files

// Socket constructor
const socket = function(io, storage, database) {

	// Functions
	this.connection = function(socket) {

		// Log to see a new user connected
		logging.log(`User was connected -> ${socket.id}`);

		socket.on('show_directory', function(data) { // Show directory event handler
			
			// Getting files that are in the directory
			storage.show_directory(data.path).then(function(items) { 
				
				// Sending these files to user with show_directory event
				io.sockets.connected[socket.id].emit('show_directory', { items: items }); 
			});
		});

		socket.on('create_folder', function(data) { // Create new folder event handler
			
			let folder_path = path.join(STORAGE_PATH, data.email, data.path, data.folder_name);
			
			storage.create_directory(folder_path).then(function() {
				io.sockets.connected[socket.id].emit('folder_created', {}); // Emitting socket event
			}).catch(function(error) {
				logging.error(`Error: ${error.message}`);
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

		socket.on('get_item_data', function(email) { // Get data about user event handler
			database.get_item_data(email).then(function(data) {
				storage.get_parsed_size(path.join(STORAGE_PATH, email)).then(function(size) {
					data.size = size;
					io.sockets.connected[socket.id].emit('item_data', data); // Emitting socket event
				});
			});
		});

		socket.on('get_size', function(email) { // Get size of user's storage event handler
			storage.get_parsed_size(path.join(STORAGE_PATH, email)).then(function(size) {
				io.sockets.connected[socket.id].emit('get_size', size); // Emitting socket event
			});
		});
	}
}

// Exports
module.exports = socket;