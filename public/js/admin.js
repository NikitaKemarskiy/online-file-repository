$(document).ready(function() {

	// Constants
	const socket = io(); // Socket initialization

	// jQuery selectors
	const users = $('div.users-list ul li.user');
	const stat_login = $('div.panel div.user-stats p.user-login strong');
	const stat_email = $('div.panel div.user-stats p.user-email strong');
	const stat_admin = $('div.panel div.user-stats p.user-admin strong');

	// Click events
	users.on('click', function(event) {
		let email = $(this).children('div.user-element').text();
		socket.emit('get_item_data', email);
	});

	// Socket.io
	socket.on('item_data', function(data) {
		stat_login.text(data.login.toString());
		stat_email.text(data.email.toString());
		stat_admin.text(data.admin.toString());
	});
});