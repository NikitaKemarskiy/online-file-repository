// Modules
const mongoose = require('mongoose');

// Variables
const user_schema = new mongoose.Schema({ // Schema for users in database
	login: {
		type: String,
		required: true
	},
 	password: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	}
});

const user = mongoose.model('user', user_schema);

// Functions
let connect = function(host, port, name) { // Connect to the database

	mongoose.connect(`mongodb://${host}:${port}/${name}`, { useNewUrlParser: true }) 
		.then(function() { // Success
			console.log('MongoDB was successfully connected!');
		})
		.catch(function(error) { // Error
			console.error(`Database connection error: ${error.message}`);
		});
}

let add_item = function(login, password, email) { // Save the item in the database

	return new Promise(function(resolve, reject) {

		let user_item = new user({
			login: login,
			password: password,
			email: email
		});

		user_item.save(function(error, user_item) {
			if (error) {
				console.error(`Database save error: ${error.message}`);
			} else {
				resolve();
			}
		});
	});
}

let find_item = function(email) { // Find the item in the database

	return new Promise(function(resolve, reject) {

		let items_length = 0;

		user.find({ email: email }, function(error, items) {
			if (error) {
				console.error(`Database search error: ${error.message}`);
			} else {
				resolve(items.length);
			}
		});
	});
}

let check_item = function(email) { // Check if the item with specific email and password exists

	return new Promise(function(resolve, reject) {

		user.find({ email: email }, function(error, items) {

			if (error) {
				console.error(`Database search error: ${error.message}`);
			} else {
				if (items.length > 0) {
					resolve({ exists: true, password: items[0].password });
				} else {
					resolve({ exists: false });
				}
			}
		});
	});
}

// Exports
module.exports = {
	connect,
	add_item,
	find_item,
	check_item
};