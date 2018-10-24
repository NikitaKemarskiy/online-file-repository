// Modules
const jszip = require('jszip');
const path = require('path');
const fs = require('fs');

// Archiver constructor
const archiver = function(storage) {

	// Object that contains functions connected with counting the items
	const items_counting = { 
	
		// Function that counts a number of items to zip (including items inside the subfolders)
		count_items_to_zip: function(items_path, items_parsed) { 

			let items_to_zip = 0; // A number of items to zip
			let directories = []; // Array for pushing directories to count items inside of them later 

			return new Promise(function(resolve, reject) {

				if (items_parsed.length === 0) { // If there're no items -> resolve 0
					resolve(0); 
				} else { // If items array isn't empty -> count number of items

					for (let i = 0; i < items_parsed.length; i++) {

						if (items_parsed[i].type === 'folder') { // Item is a folder -> push it into the directories array
							directories.push(items_parsed[i].name);
						}

						items_to_zip++; // Incrementing the number of items to zip
					}

					if (directories.length > 0) { // If directories are among the items -> count items which are inside them
						
						items_counting.count_items_in_directories(items_path, directories).then(function(result){
							items_to_zip += result;
							resolve(items_to_zip);
						});
					} else { // If there're no directories among the items -> resolve current number of items to zip
						resolve(items_to_zip);
					}
				}
			});
		},

		// Function that counts a number of items inside folders to zip
		count_items_in_directories: function(directories_path, directories) { 

			let async_calls_counter = 0; // Variable that contains a number of async calls into the loop
			let items_in_directories = 0; // Variable that contains a number of items inside the folder to zip

			return new Promise(function(resolve, reject) {
				
				for (let i = 0; i < directories.length; i++) {

					let directory_path = path.join(directories_path, directories[i]); // Current folder path

					fs.readdir(directory_path, function(error, directory_items) { // Reading this folder
						if (error) {
							console.error(`Error: ${error.message}`);
						} else {	
							// Calling count items to zip functions inside the current folder
							items_counting.count_items_to_zip(directory_path, directory_items).then(function(result) { 

								items_in_directories += result; // Incrementing a number of items inside the folder to zip
								async_calls_counter++; // Incrementing an amount of async calls
								
								// If it's the last needed call -> resolve with a number of items inside the folder
								if (async_calls_counter >= directories.length) { 
									resolve(items_in_directories);
								}
							});
						}
					}); 
				}
			});
		}
	};

	// Object that contains functions connected with processing zip archive
	const zip_processing = {

		// Function that generates a zip archive
		generate_zip: function(zip, archive_path) { 
		
			return new Promise(function(resolve, reject) {
				zip.generateNodeStream({ type:'nodebuffer', streamFiles:true }) // Creating readable stream of zip 
					.pipe(fs.createWriteStream(archive_path)) // Piping this stream to writable
					.on('finish', function () { // Archive was created
				    	resolve(archive_path);
					});	
			});
		},

		// Function that adds files inside some folder to archive
		add_directory_to_zip: function(directory, directory_path, items_parsed) { 

			let async_calls_counter = 0; // Variable that contains a number of async calls into the loop

			return new Promise(function(resolve, reject) {

				if (items_parsed === undefined) { // If items aren't passed -> add all the items inside the directory to zip archive

					fs.readdir(directory_path, function(error, directory_items) { // Reading the folder
						
						if (error) {
							console.error(`Error: ${error.message}`);
						} else {

							// Calling count items to zip function to get a number of async calls
							items_counting.count_items_to_zip(directory_path, directory_items).then(function(items_to_zip) { 

								storage.parse_items(directory_path, directory_items).then(function(items_parsed) {

									for (let i = 0; i < items_parsed.length; i++) {

										let item_path = path.join(directory_path, items_parsed[i].name); // File path

										if (items_parsed[i].type === 'file') { // Item is a file

											fs.readFile(item_path, function(error, buffer) { // Read file from items array

												if (error) {
													console.error(`Error: ${error.message}`);
												} else {
													directory.file(items_parsed[i].name, buffer, { binary: true }); // Inputing file into the zip archive

													async_calls_counter++; // Incrementing an amount of async calls

													if (async_calls_counter >= items_to_zip) { // If it's the last needed call -> resolve a new directory
														resolve({
															directory,
															async_calls_counter
														});
													}
												}
											});
										} else { // Item is a folder

											let new_directory = directory.folder(items_parsed[i].name);

											zip_processing.add_directory_to_zip(new_directory, item_path).then(function(result) {

												new_directory = result.directory;
												async_calls_counter += result.async_calls_counter + 1;

												if (async_calls_counter >= items_to_zip) { // If it's the last needed call -> save a zip archive to the storage
													resolve({
														directory,
														async_calls_counter
													});
												}
											});
										}
									}
								});
							});
						}
					});
				} else { // Items were passed -> add only these items inside zip archive

					// Calling count items to zip function to get a number of async calls
					items_counting.count_items_to_zip(directory_path, items_parsed).then(function(items_to_zip) { 

						for (let i = 0; i < items_parsed.length; i++) {

							let item_path = path.join(directory_path, items_parsed[i].name); // Current file path

							if (items_parsed[i].type === 'file') { // Item is a file

								fs.readFile(item_path, function(error, buffer) { // Read file from items array
									
									if (error) {
										console.error(`Error: ${error.message}`);
									} else {

										directory.file(items_parsed[i].name, buffer, { binary: true }); // Inputing file into the zip archive

										async_calls_counter++; // Incrementing an amount of async calls

										if (async_calls_counter >= items_to_zip) { // If it's the last needed call -> save a zip archive to the storage
											resolve({
												directory,
												async_calls_counter
											});
										}
									}
								});
							} else { // Item is a folder

								let new_directory = directory.folder(items_parsed[i].name); // Inputing folder into the zip archive

								zip_processing.add_directory_to_zip(new_directory, item_path).then(function(result) { // Reading all the files inside this folder and inputing them into it

									new_directory = result.directory;
									async_calls_counter += result.async_calls_counter + 1; // Increasing an amount of async calls

									if (async_calls_counter >= items_to_zip) { // If it's the last needed call -> create a zip archive to the storage
										resolve({
											directory,
											async_calls_counter
										});
									}
								});
							}
						}
					});
				}
			});
		},
	};	

	// Export function that initializes and creates a zip archive
	this.write_zip = function(items_path, items_parsed, archive_path) { 

		let async_calls_counter = 0; // Variable that contains a number of async calls into the loop
		let zip = new jszip();

		return new Promise(function(resolve, reject) {

			zip_processing.add_directory_to_zip(zip, items_path, items_parsed).then(function(result) { // Calling add directory to zip function for the items folder
				zip = result.directory;
				zip_processing.generate_zip(zip, archive_path).then(function(result) {
					resolve(result);
				});
			});
		});
	}

	this.generate_zip_name = function(email) {

		let archive_name = email + '.' + Math.round(Math.random() * 1000000000);
		return archive_name;
	}
}

// Exports
module.exports = archiver;