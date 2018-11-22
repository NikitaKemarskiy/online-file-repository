// Modules
const path = require('path');
const fs = require('fs');

// Constants
const LOGS_PATH = path.join(process.cwd(), 'logs'); // Constant value for storage folder
const LOGS_FILE = 'logs.txt';
const ERROR_FILE = 'error.txt';

let log_stream = null;
let error_stream = null;

const start_logging = function() {
	let log_path = path.join(LOGS_PATH, LOGS_FILE);
	let error_path = path.join(LOGS_PATH, ERROR_FILE);
	log_stream = fs.createWriteStream(log_path);
	error_stream = fs.createWriteStream(error_path);
}

const end_logging = function() {
	log_stream.end();
	error_stream.end();
}

const log = function(str) {
	console.log(str);
	str = str.toString();
	str = str.concat('\n');
	log_stream.write(str, 'utf8');
}

const error = function(str) {
	console.log(str);
	str = str.toString();
	str = str.concat('\n');
	error_stream.write(str, 'utf8');
}

module.exports = {
	start_logging,
	end_logging,
	log,
	error
};