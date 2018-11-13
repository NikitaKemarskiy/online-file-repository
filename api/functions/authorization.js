// Modules
const is_email = require('isemail');
const argon2 = require('argon2');

// Functions
const check_sign_in = function(email, password, database) { // Function that checks if sign in info valid

	return new Promise(function(resolve, reject) {

		database.check_item(email).then(function(result) { // Checking if user in a database
				
			if (result.exists) { // User is in a database
				
				argon2.verify(result.password, password).then(function(match) { // Verifying the password
					if (match) { // Password is right -> authorize the user
				   		resolve(true);
				  	} else { // Password is wrong -> resolve false
				    	resolve(false);
				  	}
				}).catch(function(error) {
					console.error(`Error: ${error.message}`);
				});
			
			} else { // User isn't in a database -> resolve false
				resolve(false);
			}
		});
	});
}

const check_admin_sign_in = function(email, password, database) { // Function that checks if admin sign in info valid

	return new Promise(function(resolve, reject) {

		database.check_admin_item(email).then(function(result) { // Checking if the admin in a database

			if (result.exists) { // Admin is in a database

				argon2.verify(result.password, password).then(function(match) { // Verifying the password
					if (match) { // Password is right -> authorize the user
				   		resolve(true);
				  	} else { // Password is wrong -> resolve false
				    	resolve(false);
				  	}
				}).catch(function(error) {
					console.error(`Error: ${error.message}`);
				});

			} else { // Admin isn't in a database -> resolve false
				resolve(false);
			}
		});
	});
}

const check_sign_up = function(email, login, password, confirm_password, database) { // Function that checks if sign up data valid

	return new Promise(function(resolve, reject) {

		// Email or login or password isn't string -> error
		if (typeof(email) !== 'string' || typeof(login) !== 'string' || typeof(password) !== 'string') { 
			resolve({ success: false, error_message: 'invalid data' });
			return void 0;
		}

		// Login is < 8 or > 24 -> error
		if (login.length < 8 || login.length > 24) { 
			resolve({ success: false, error_message: 'the length of the login must be from 8 to 24 characters' });
			return void 0;
		}

		// Password is < 8 -> error
		if (password.length < 8 && password.length > 32) { 
			resolve({ success: false, error_message: 'the length of the password must be from 8 to 32 characters' });
			return void 0;
		}

		// Invalid email -> error
		if (!is_email.validate(email)) { 
			resolve({ success: false, error_message: 'invalid Email' });
			return void 0;
		}

		// Confirmed password differs from original password -> error
		if (password !== confirm_password) { 
			resolve({ success: false, error_message: 'confirmed and original passwords are different' });
			return void 0;
		}

		// Checking if user in the database
		check_if_exists(email, database).then(function(result) { 

			if (!result) { // Check if the user doesn't exist
				
				argon2.hash(password).then(function(hash) { // Hashing the password

					resolve({ success: true, hash: hash }); // Everything is ok -> sign user up
				
				}).catch(function(error) {
					console.error(`Error: ${error.message}`);
				});
			} else { // User already exists -> error
				resolve({ success: false, error_message: 'user with this Email already exists' });
			}
		});					
	});	
}

const check_if_exists = function(email, database) { // Function that checks if user is in the database

	return new Promise(function(resolve, reject) {

		let items_length = 0;

		database.find_item(email).then(function(length) {
		
			items_length = length;
			
			if (items_length > 0) {
				resolve(true);
			} else {
				resolve(false);
			}
		});

	});
}

// Exports
module.exports = {
	check_sign_in,
	check_sign_up,
	check_admin_sign_in,
	check_if_exists
}