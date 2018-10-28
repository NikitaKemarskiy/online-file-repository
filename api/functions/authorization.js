// Modules
const is_email = require('isemail');

// Functions
const check_sign_in = function(email, password, database) { // Function that checks if sign in info valid

	return new Promise(function(resolve, reject) {

		database.check_item(email, password).then(function(result) { // Checking is user in the database
		
			if (result) { // User is in a database
				resolve(true);
			} else { // User isn't in a database
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

		if (login.length < 8 || login.length > 24) { // Login is < 8 or > 24 -> error
			resolve({ success: false, error_message: 'the length of the login must be from 8 to 24 characters' });
			return void 0;
		}

		if (password.length < 8 && password.length > 32) { // Password is < 8 -> error
			resolve({ success: false, error_message: 'the length of the password must be from 8 to 32 characters' });
			return void 0;
		}

		if (!is_email.validate(email)) { // Invalid email -> error
			resolve({ success: false, error_message: 'invalid Email' });
			return void 0;
		}

		if (password !== confirm_password) { // Confirmed password differs from original password -> error
			resolve({ success: false, error_message: 'confirmed and original passwords are different' });
			return void 0;
		}

		check_if_exists(email, database).then(function(result) { // Checking if user in the database

			if (!result) { // Check if the user doesn't exist
				resolve({ success: true }); // Everything is ok -> sign user up

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
	check_if_exists
}