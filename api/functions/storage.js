// Modules
const path = require('path');
const fs = require('fs');

// Variables
const storage_path = path.join(process.cwd(), 'storage', 'users');

// Functions
const parse_files = function(directory_path, items) { // Parse files in a directory into an array with objects

	let items_array = [];

	for (let i = 0; i < items.length; i++) {

		let item_path = path.join(directory_path, items[i]);

		try {
			let stats = fs.statSync(item_path);

			if (stats.isDirectory()) { // Item is a directory

				items_array.push({
					type: 'directory',
					name: items[i]
				});
			} else if (stats.isFile()) { // Item is a file

				items_array.push({
					type: 'file',
					name: items[i]
				});
			}
		} catch(error) {
			console.error(`Error: ${error.message}`);
		}
	}

	return items_array;
}

const check_if_directory_exists = function(path) { // Check if directory exists

	return new Promise(function(resolve, reject) {
		fs.stat(path, function(error, stats) {
			if (error) {
				resolve(false); // Directory doesn't exist
			} else {
				resolve(true); // Directory exists
			}
		});
	});
}

const show_storage = function(email) { // Show main storage directory
	
	return new Promise(function(resolve, reject) {
		
		let user_path = path.join(storage_path, email);

		check_if_directory_exists(user_path).then(function(result) {

			if (result) { // User's storage already exists

				fs.readdir(user_path, function(error, items) {
					if (error) {
						console.error(`Error: ${error.message}`);
						resolve([]);
					} else {
						resolve(parse_files(user_path, items));
					}
				});
			} else { // User's storage doesn't exist
				fs.mkdir(user_path, function(error) { // Creating user's storage directory
					if (error) {
						console.error(`Error: ${error.message}`);
						resolve([]); // Return empty array (no files inside a storage) 
					} else {
						resolve([]); // Return empty array (no files inside a storage)
					}
				});
			}
		});
	});
};

const show_directory = function(directory_path) { // Show directory
	//...
}

// Exports
module.exports.show_storage = show_storage;