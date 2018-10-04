$(document).ready(function() {

	// Variables
	const socket = io(); // Socket initialization
	let user_email = $('.header-email').eq(0).text().replace(/\s/g, ''); // User's email
	let current_path = '/'; // Current storage path
	
	// jQuery elements
	let files_list = $('.storage ul').eq(0); // Ul in the storage, which contains files
	let files_list_element = $('.storage ul li'); // Li elements of this ul
	let path_paragraph = $('.path p').eq(0);

	// Functions
	const update_info = function(new_path) { // Update current path on the page and clear storage files list

		path_paragraph.text(`path: ${new_path}`);
		files_list.text('');
	}

	files_list_element.on('click', function() {

		if (this.classList[0] === 'folder') { // Clicked item is a folder

			current_path += `${this.textContent}/`; // Changing current path to a new path
			update_info(current_path); // Update current path on the page and clear storage files list

			socket.emit('show_directory', { path: user_email + current_path });
		}
	});

	// Socket.io
	socket.on('show_directory', function(data) { // Show directory event handler

		for (let i = 0; i < data.items.length; i++) { // Append every sent item in the storage div
			files_list.append(`<li class="${data.items[i].type}"><div class="storage-element">${data.items[i].name}</div></li>`);
		}
	});
});