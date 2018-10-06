$(document).ready(function() {

	// Variables
	const socket = io(); // Socket initialization
	const user_email = $('.header-email').eq(0).text().replace(/\s/g, ''); // User's email
	let current_path = ['/']; // Current storage path
	
	// jQuery elements
	const files_list = $('.storage ul').eq(0); // Ul in the storage, which contains files
	const path_paragraph = $('.path p').eq(0);

	// Functions
	const parse_path_into_string = function(path) { // Function that parses path array into string format
		
		let path_string = '';

		for (let i = 0; i < path.length; i++) { // Adding every path array item to string
			path_string += path[i]; 
		}

		return path_string;
	}

	const check_directory = function(new_directory) { // Function that changes user's current directory

		if (new_directory !== '..') { // If user is moving to the subfolder

			current_path.push(`${new_directory}/`); // Changing current path to a new path

		} else { // If user is moving to the parental folder
			
			current_path.splice(-1, 1); // Deleting last element of current path array (moving to the parental folder)
		}

		let current_path_string = parse_path_into_string(current_path); // Parse current path array into string format

		update_info(current_path_string); // Update current path on the page and clear storage files list

		return current_path_string;
	}

	const update_info = function(new_path) { // Update current path on the page and clear storage files list

		path_paragraph.text(`path: ${new_path}`); // Changing user's current path shown at the page

		files_list.text(''); // Clearing user's storage at the page
	}

	files_list.on('click', "li", function() { // Click at the storage item

		if (this.classList[0] === 'folder') { // Clicked item is a folder

			socket.emit('show_directory', { path: user_email + check_directory(this.textContent) }); // Go to this folder
		}
	});

	// Socket.io
	socket.on('show_directory', function(data) { // Show directory event handler

		if (current_path.length > 1) { // If new folder isn't a root directory

			files_list.append(`<li class="folder"><div class="storage-element">..</div></li>`); // Add an item of the parental folder '..'
		}

		for (let i = 0; i < data.items.length; i++) { // Append every sent item in the storage div
			
			files_list.append(`<li class="${data.items[i].type}"><div class="storage-element">${data.items[i].name}</div></li>`);
		}
	});
});