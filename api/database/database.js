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
	},
	admin: {
		type: Boolean,
		required: false
	}
});

const user = mongoose.model('user', user_schema);

// Functions
const connect = function(host, port, name) { // Connect to the database

	mongoose.connect(`mongodb://${host}:${port}/${name}`, { useNewUrlParser: true }) 
		.then(function() { // Success
			console.log('MongoDB was successfully connected!');
		})
		.catch(function(error) { // Error
			console.error(`Database connection error: ${error.message}`);
		});
}

const add_item = function(login, password, email) { // Save the item in a database

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

const add_admin_item = function(login, password, email) { // Save the admin item in a database

	return new Promise(function(resolve, reject) {

		let admin_item = new user({
			login: login,
			password: password,
			email: email,
			admin: true
		});

		admin_item.save(function(error, admin_item) {
			if (error) {
				console.error(`Database save error: ${error.message}`);
			} else {
				resolve();
			}
		});
	});
}

const find_item = function(email) { // Find the item in the database

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

const show_all_items = function() { // Show all database items (users)

	return new Promise(function(resolve, reject) {

		user.find({}, function(error, items) {
			
			let itemsArr = [];

			for (let i = 0; i < items.length; i++) {
				
				let obj = {
					email: items[i].email
				}
				/*let obj = {
					login: items[i].login,
					email: items[i].email
				};

				if (items[i].admin) {
					obj.admin = true;
				} else {
					obj.admin = false;
				}*/
				
				itemsArr.push(obj);
			}

			resolve(itemsArr);
		});
	});
}

const get_item_data = function(email) { // Show special item info

	return new Promise(function(resolve, reject) {

		user.find({ email: email }, function(error, items) {

			if (error) {
				console.error(`Database search error: ${error.message}`);
			} else {
				if (items.length > 0) {
					let obj = {
						login: items[0].login,
						email: items[0].email
					}

					if (items[0].admin) {
						obj.admin = true;
					} else {
						obj.admin = false;
					}

					resolve(obj);
				} else {
					resolve(false);
				}
			}
		})
	});
}

const check_item = function(email) { // Check if the item with specific email and password exists

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

const check_admin_item = function(email) { // Check if the admin item with specific email and password exists

	return new Promise(function(resolve, reject) {

		user.find({ email: email, admin: true }, function(error, items) {

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
	show_all_items,
	get_item_data,
	check_item,
	check_admin_item,
	add_admin_item
};