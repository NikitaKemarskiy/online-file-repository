$(document).ready(function() {

	// Variables
	const socket = io(); // Socket initialization
	let user_email = $('.header-email').eq(0).text(); // User's email
	let current_path = '/'; // Current storage path

	// Functions

	// Socket.io
	socket.on('show_directory', function(data) {
		//data.items - files
	});
});