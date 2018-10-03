// Modules
const path = require('path');
const fs = require('fs');

// Variables
const STORAGE_PATH = path.join(process.cwd(), 'storage', 'users');

// Functions
const parse_items = function(directory_path, items) { // Parse files in a directory into an array with objects

	return new Promise(function(resolve, reject) {

		let items_array_parsed = []; // Array for items im special order (folders first, files second)

		const items_array_filled = function() { // Promise function for filling the items array 

			return new Promise(function(resolve, reject) {

				const fill_items_array = function(i, items_array) { // Recursive function to get info about every file and fill items array with it

					if (i < items.length) {

						let item_path = path.join(directory_path, items[i]);

						fs.stat(item_path, function(error, stats) {

							if (error) {
								console.error(`Error: ${error.message}`);
							} else {

								if (stats.isDirectory()) { // Item is a folder

									items_array.push({
										type: 'folder',
										name: items[i]
									});
								} else if (stats.isFile()) { // Item is a file

									items_array.push({
										type: 'file',
										name: items[i]
									});
								}
								fill_items_array(i + 1, items_array);
							}

						});
					} else {
						resolve(items_array);
					} 
				}

				fill_items_array(0, []); // Calling the recursive function
			});
		}

		items_array_filled().then(function(items_array) {

			for (let i = 0; i < items_array.length; i++) { // Filling the parsed items array -> inputing folders firstly
			
				if (items_array[i].type == "folder") { // If item's type is a folder -> input
					items_array_parsed.push(items_array[i]);
				}
			}

			for (let i = 0; i < items_array.length; i++) { // Filling the parsed items array -> inputing files secondly
				
				if (items_array[i].type == "file") { // If item's type is a file -> input
					items_array_parsed.push(items_array[i]);
				}
			}


			resolve(items_array_parsed); 
		});
	});
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
		
		let user_path = path.join(STORAGE_PATH, email);

		check_if_directory_exists(user_path).then(function(result) {

			if (result) { // User's storage already exists

				fs.readdir(user_path, function(error, items) {

					if (error) {
						console.error(`Error: ${error.message}`);
						resolve([]);
					} else {
						parse_items(user_path, items).then(function(items_array) {
							resolve(items_array);
						});
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