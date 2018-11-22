// Config constructor
const config = function(session) {
	
	// Store for sessions
	const MongoStore = require('connect-mongo')(session);

	// Config
	this.database = {
		name: 'file_storage', // Database name
		host: 'localhost', // Database host
		port: '27017' // Database port
	};
	this.server = {
		host: 'localhost', // Server host
		port: '1337' // Server port
	};
	this.session = {
		name: 'session_id', // Name of session id value
		secret: 'fileStorageSecretKey', // Secret key for encrypting
		resave: true,
		saveUninitialized: true,
		cookie: {
			path: '/',
			maxAge: 6.048e8, // Session expires in a week
			httpOnly: true // Cookie isn't visible for client-side javascript
		},
		store: new MongoStore({
	      	url: 'mongodb://localhost/file_storage_sessions'
	    })
	};
	this.storage = {
		limit: 4 * 1024 * 1024 * 1024 // User's storage size limit
	}
}

module.exports = config;

// 77.47.209.52
