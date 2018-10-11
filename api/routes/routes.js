// Modules
const express = require('express');
const path = require('path');

// Initialization
const router = express.Router();

// Functions
const authorization = require('../functions/authorization.js'); // Authorization functions
const storage = require('../functions/storage.js'); // Work with storage functions
const socket_constructor = require('../functions/socket.js'); // Socket.io functions constructor

// Routing initialization function
const router_init = function(io, config) {

	// MongoDB
	const database = require('../database/database.js');
	database.connect(config.database.host, config.database.port, config.database.name);

	// Socket.io functions
	const socket = new socket_constructor(io, storage);

	// Socket.io
	io.on('connection', socket.connection);

	// Routes
	router.get('/', function(req, res) { // Main page

		if (req.session.authorized === undefined) { // User isn't authorized -> to the sign_in page

			res.redirect('sign_in');
		} else {

			if (!req.session.authorized) { // User isn't authorized -> to the sign_in page

				res.redirect('sign_in');
			}  else { // User is authorized -> to the main page

				res.header('StatusCode', '200');
				res.header('Content-Type', 'text/html; charset=utf-8');

				let storage_size = 100;

				storage.show_storage(req.session.email).then(function(items) { // Show main storage directory
					
					console.dir({ items }); // test log

					res.render(path.join(process.cwd(), 'public/html/main.hbs'), { 
						user_email: req.session.email, 
						storage_size: ``,
						items: items
					});
				});
			}
		}
	});

	router.get('/sign_in', function(req, res) { // Sign in page

		res.header('StatusCode', '200');
		res.header('Content-Type', 'text/html; charset=utf-8');

		res.render(path.join(process.cwd(), 'public/html/sign_in.hbs'));
	});

	router.get('/sign_in/:error_message', function(req, res) { // Sign in page with an error message

		res.header('StatusCode', '200');
		res.header('Content-Type', 'text/html; charset=utf-8');

		res.render(path.join(process.cwd(), 'public/html/sign_in.hbs'), { error: true, error_message: req.params.error_message });
	});

	router.get('/sign_up', function(req, res) { // Sign up page

		res.header('StatusCode', '200');
		res.header('Content-Type', 'text/html; charset=utf-8');

		res.render(path.join(process.cwd(), 'public/html/sign_up.hbs'), { error: false });
	});

	router.get('/sign_up/:error_message', function(req, res) { // Sign up page with an error message

		res.header('StatusCode', '200');
		res.header('Content-Type', 'text/html; charset=utf-8');

		res.render(path.join(process.cwd(), 'public/html/sign_up.hbs'), { error: true, error_message: req.params.error_message });
	});

	router.post('/sign_in_handler', function(req, res) { // Sign in post handler
		
		authorization.check_sign_in(req.body.email, req.body.password, database).then(function(result) { // Checking sign in data

			if (result) { // User is in a database -> success

				req.session.authorized = true; // Input in session, that user is authorized
				req.session.email = req.body.email; // Input user's email in session

				res.redirect('/');

			} else { // User isn't in a database

				let error_message = encodeURIComponent('invalid email or password');

				res.redirect(`/sign_in/${error_message}`);
			}
		});
	});

	router.post('/sign_up_handler', function(req, res) { // Sign up post handler

		authorization.check_sign_up( // Checking sign up data
			req.body.email,
			req.body.login,
			req.body.password,
			req.body.confirm_password,
			database
		).then(function(check_sign_up_result) {

			if (check_sign_up_result.success) { // Sign up data is valid -> success

				database.add_item(req.body.login, req.body.password, req.body.email).then(function() { // Save new user in the database
					
					console.log('Item was successfully saved!');

					req.session.authorized = true;
					req.session.email = req.body.email;

					res.redirect('/');
				});

			} else { // Sign up data is invalid -> error

				let error_message = encodeURIComponent(check_sign_up_result.error_message);

				res.redirect(`/sign_up/${error_message}`);
			}
		});
	});

	router.get('/sign_out_handler', function(req, res) { // Sign out handler

		req.session.email = undefined; // Deleting user's session data and making him unauthorized
		req.session.authorized = undefined;

		res.redirect('/sign_in');
	});

	return router;
}

// Exports
module.exports = router_init;