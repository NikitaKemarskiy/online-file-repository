// Modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Constants
const ARCHIVES_PATH = path.join(process.cwd(), 'storage', 'archives'); // Constant value for folder with archives
const STORAGE_PATH = path.join(process.cwd(), 'storage', 'users'); // Constant value for storage folder

// Initialization
const router = express.Router();
const upload_storage = multer.diskStorage({
	destination: function (req, file, callback) { // Function which sets the folder for uploading files
		let upload_path = path.join(STORAGE_PATH, req.body.email, req.body.path);
		callback(null, upload_path);
	},
	filename: function (req, file, callback) { // Functions which sets uploaded file name
		callback(null, file.originalname);
	}
});
const upload = multer({ 
	storage: upload_storage,
	limits: {
		fileSize: 1024 * 1024 * 1024 // 1GB limit 
	}
}).array('files');

// Functions
const authorization = require('../functions/authorization.js'); // Authorization functions
const storage = require('../functions/storage.js'); // Work with storage functions
const socket_constructor = require('../functions/socket.js'); // Socket.io functions constructor
const archiver_constructor = require('../archiver/archiver.js'); // Archiver functions constructor

// Routing initialization function
const router_init = function(io, config) {

	// MongoDB
	const database = require('../database/database.js');
	database.connect(config.database.host, config.database.port, config.database.name);

	// Functions
	const socket = new socket_constructor(io, storage); // Socket.io functions
	const archiver = new archiver_constructor(storage); // Archiver function

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

				database.add_item(req.body.login, check_sign_up_result.hash, req.body.email).then(function() { // Save new user in the database

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
	
	router.post('/files/download', function(req, res) { // Download files post request handler

		// Parsing JSON string with items into array
		req.body.items = JSON.parse(req.body.items); 

		// Variables
		let items_path = path.join(STORAGE_PATH, req.body.email, req.body.path);
		let archive_path = path.join(ARCHIVES_PATH, req.body.archive_name); 
		
		// Creating a zip archive
		archiver.write_zip(items_path, req.body.items, archive_path).then(function(result) { 
			
			// Setting the header that send file is an archive 
			res.header('Content-type', 'application/zip');
			
			// Sending an archive to the client	 
			res.download(archive_path, req.body.archive_name);

			// Event after sending the archive
			res.on('finish', function() {
				// Deleting this archive
				fs.unlink(archive_path, function(error) {
					if (error) {
						console.error(`Error: ${error.message}`);
					} else {
						console.log(`Archive was sent and deleted: ${archive_path}`);
					}
				});
			}); 
		});
	});

	router.post('/files/upload', function(req, res) {
		upload(req, res, function(error) {
			if (error instanceof multer.MulterError) {
		    	console.error(`Error: ${error.message}`);
		    	res.end('Error uploading files');
		    } else if (error) { // An unknown error occurred when uploading.
		    	console.error(`Error: ${error.message}`);	
		    	res.end('Error uploading files');
		    } else {
				console.dir(req.files);
				res.end('Files were successfully uploaded');
			}
		});
	});

	return router;
}

// Exports
module.exports = router_init;