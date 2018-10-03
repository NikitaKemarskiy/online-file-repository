// Config constructor
const config = function(session) {
	
	const MongoStore = require('connect-mongo')(session);

	this.database = {
		name: 'file_storage', // database name
		host: 'localhost', // database host
		port: '27017' // database port
	};
	this.server = {
		host: 'localhost', // server host
		port: '1337' // server port
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
	}
}

module.exports = config;

//77.47.209.52