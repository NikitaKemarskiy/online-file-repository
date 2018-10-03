// Functions
const check_sign_in = function(email, password, database) { // Check if sign in info valid
	
	return new Promise(function(resolve, reject) {

		database.check_item(email, password).then(function(result) {
		
			if (result) { // User is in a database
				resolve(true);
			} else { // User isn't in a database
				resolve(false);
			}
		});
	});
}

const check_sign_up = function(email, login, password, confirm_password, database, is_email) { // Check if sign up data valid

	return new Promise(function(resolve, reject) {

		if (typeof(email) == 'string' && typeof(login) == 'string' && typeof(password) == 'string') { 

			if (login.length >= 8 && login.length <= 24) { // Check if login length is >= 8 and <= 24

				if (password.length >= 8 && password.length <= 32) { // Check if password length is >= 8 and <= 32

					if (is_email.validate(email)) { // Check if email is correct

						if (password === confirm_password) { // Check if confirmed and original passwords are the same

							check_if_exists(email, database).then(function(result){

								if (!result) { // Check if the user doesn't exist
									resolve({ success: true }); // Everything is ok -> sign user up

								} else { // User already exists -> error
									resolve({ success: false, error_message: 'user with this Email already exists' });
								}
							});
											
						} else { // Confirmed password differs from original password -> error
							resolve({ success: false, error_message: 'confirmed and original passwords are different' });
						}
										
					} else { // Invalid email -> error
						resolve({ success: false, error_message: 'invalid Email' });
					}
									
				} else { // Password is < 8 -> error
					resolve({ success: false, error_message: 'the length of the password must be from 8 to 32 characters' });
				}
								
			} else { // Login is < 8 or > 24 -> error
				resolve({ success: false, error_message: 'the length of the login must be from 8 to 24 characters' });
			}

		} else { // Email or login or password isn't string -> error
			resolve({ success: false, error_message: 'invalid data' });
		}
	});
}

const check_if_exists = function(email, database) { // Check if user already exists

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
module.exports.check_sign_in = check_sign_in;
module.exports.check_sign_up = check_sign_up;
module.exports.check_if_exists = check_if_exists;