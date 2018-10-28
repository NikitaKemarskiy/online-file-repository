// Modules
const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;

// Variables
const STORAGE_PATH = path.join(process.cwd(), 'storage', 'users'); // Constant value for storage folder

// Functions
const sort_items = function(items_array) { // Functions that sorts the items in the special order (folders first, files second)

	let items_array_sorted = []; // Array for items parsed in the special order

	for (let i = 0; i < items_array.length; i++) { // Filling the parsed items array -> inputing folders firstly
		if (items_array[i].type === "folder") { // If item's type is a folder -> input
			items_array_sorted.push(items_array[i]);
		}
	}

	for (let i = 0; i < items_array.length; i++) { // Filling the parsed items array -> inputing files secondly
		if (items_array[i].type === "file") { // If item's type is a file -> input
			items_array_sorted.push(items_array[i]);
		}
	}

	return items_array_sorted; // Returning array of sorted items
}

const parse_items = function(items_path, items) { // Function that parses files in a directory into an array with objects

	return new Promise(function(resolve, reject) {

		const items_array_filled = function() { // Promise function for filling the items array 

			let items_array = []; // Array for items
			let async_calls_counter = 0; // Variable that contains an amount of async calls into the loop

			return new Promise(function(resolve, reject) {

				for (let i = 0; i < items.length; i++) {

					let item_path = path.join(items_path, items[i]); // Current item path

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
							
							async_calls_counter++;

							if (async_calls_counter === items.length) { // If it's the last file -> resolving the promise
								resolve(items_array);
							}
						}

					});
				}
			});
		}

		items_array_filled().then(function(items_array) { // After getting all the files stats -> sort it (folder first - files second)
			items_array_sorted = sort_items(items_array);
			resolve(items_array_sorted);
		});
	});
}

const delete_items = function(items_path, items) { // Function that deletes files / directories on the specified path 

	let async_calls_counter = 0;

	return new Promise(function(resolve, reject) {

		for (let i = 0; i < items.length; i++) {

			let item_path = path.join(items_path, items[i].name);

			if (items[i].type === 'folder') { // Item is a directory
				exec('rm -r ' + item_path, function (error) {
		  			if (error) {
		  				console.error(`Error: ${error.message}`);
		  			}
		  			async_calls_counter++;

		  			if (async_calls_counter === items.length) {
		  				resolve(true);
		  			}
				});
			} else { // Item is a file
				fs.unlink(item_path, function(error) {
					if (error) {
		  				console.error(`Error: ${error.message}`);
		  			}
					async_calls_counter++;

					if (async_calls_counter === items.length) {
						resolve(true);
					}
				});
			}
		}
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
			} else if (items.length === 0) { // The folder is empty -> resolve empty array
				resolve([]);
			} else { // The folder has items -> parse them and resolve array with parsed items
				parse_items(user_path, items).then(function(items_array) {
					resolve(items_array);
				});
			}
		});
	});
}

// Exports
module.exports = {
	parse_items,
	delete_items,
	show_storage,
	show_directory
};