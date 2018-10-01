// Modules
const path = require('path');
const fs = require('fs');

// Variables
const storage_path = path.join(process.cwd(), 'storage', 'users');

// Functions
const check_if_directory_exists = function(path) { // Check if directory exists

	return new Promise(function(resolve, reject) {

		try {

			fs.statSync(path);
    		resolve(true); // Directory exists
  		} catch(e) {

    		resolve(false); // Directory doesn't exist
  		}
	});
}

const show_path = function(email) {
	
	return new Promise(function(resolve, reject) {
		
		let user_path = path.join(storage_path, email);

		check_if_directory_exists(user_path).then(function(result) {

			if (result) { // User's storage already exists
				resolve(true);
			} else { // User's storage doesn't exist
				resolve(false);
			}
		});
	});
};

// Exports
module.exports.show_path = show_path;