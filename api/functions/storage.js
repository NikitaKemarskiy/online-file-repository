// Modules
const path = require('path');
const fs = require('fs');

// Variables
const STORAGE_PATH = path.join(process.cwd(), 'storage', 'users'); // Constant value for storage folder

// Functions
const parse_items = function(directory_path, items) { // Function that parses files in a directory into an array with objects

	return new Promise(function(resolve, reject) {

		let items_array_parsed = []; // Array for items in special order (folders first, files second)
		let items_array = [];

		const items_array_filled = function() { // Promise function for filling the items array 

			return new Promise(function(resolve, reject) {

				for (let i = 0; i < items.length; i++) {

					let item_path = path.join(directory_path, items[i]); // Current item path

					fs.stat(item_path, function(error, stats) { // Getting info about current item

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
							
							if (i === items.length - 1) { // If it's the last file -> resolving the promise
								resolve(items_array);
							}
						}

					});
				}
			});
		}

		items_array_filled().then(function(items_array) { // After getting all the files stats -> parse it (folder first - files second)

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

const check_if_directory_exists = function(path) { // Function that checks if directory exists

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

const show_storage = function(email) { // Function that shows main storage directory
	
	return new Promise(function(resolve, reject) {
		
		let user_path = path.join(STORAGE_PATH, email);

		check_if_directory_exists(user_path).then(function(result) { // Checking if user's storage already exists

			if (result) { // User's storage already exists -> show it

				show_directory(email).then(function(items_array) {
					resolve(items_array);
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

const show_directory = function(directory_path) { // Function that shows directory

	let user_path = path.join(STORAGE_PATH, directory_path);

	return new Promise(function(resolve, reject) {

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
	});
}

/*const get_file = function(file_path) {

	return fs.createReadStream(path.join(STORAGE_PATH, file_path));
}*/

// Exports
module.exports.show_storage = show_storage;
module.exports.show_directory = show_directory;
/*module.exports.get_file = get_file;*/