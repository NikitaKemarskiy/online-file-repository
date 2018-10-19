// Modules
const path = require('path');

// Variables
const ARCHIVES_PATH = path.join(process.cwd(), 'storage', 'archives'); // Constant value for folder with archives
const STORAGE_PATH = path.join(process.cwd(), 'storage', 'users'); // Constant value for storage folder

// Functions
const archiver_constructor = require('../archiver/archiver.js'); // Archiver functions constructor

// Socket constructor
const socket = function(io, storage) {

	// Arhiver functions
	const archiver = new archiver_constructor(storage);

	// Functions
	this.connection = function(socket) {

		// Log to see a new user connected
		console.log(`User was connected -> ${socket.id}`);

		socket.on('show_directory', function(data) { // Show directory event handler

			storage.show_directory(data.path).then(function(items) { // Getting files that are in the directory
					
				io.sockets.connected[socket.id].emit('show_directory', { items: items }); // Sending these files to user with show_directory event
			});
		});

		socket.on('zip_files', function(data) {

			// data.email - user's email
			// data.path - directory from which user wants to download some files
			// data.items - array with files names
			// data.items.item_name - item name
			// data.items.item_type - item type

			// Log to see info about user's request for downloading
			console.dir(data);

			// Variables
			let items_path = path.join(STORAGE_PATH, data.email, data.path);
			let archive_path = path.join(ARCHIVES_PATH, 'out.zip'); 

			archiver.write_zip(items_path, data.items, archive_path).then(function(result) { // Creating a zip archive
				
				// Log to see the path of created archive
				console.log(result);

				io.sockets.connected[socket.id].emit('zip_created', { result });
			});
		});
	}
}

// Exports
module.exports = socket;