$(document).ready(function() {

	// Variables
	const socket = io(); // Socket initialization
	const user_email = $('.header-email').eq(0).text().replace(/\s/g, ''); // User's email
	const current_path = ['/']; // Current storage path
	
	// jQuery elements
	const files_list = $('.storage ul').eq(0); // Ul in the storage, which contains li elements (files)
	const path_paragraph = $('.path p').eq(0); // Paragramh which contains path
	const download_button = $('.path .button'); // Button for downloading files

	// Functions
	const download = { // Functions connected with downloading

		check_selected_items: function() { // Function that checks are there any selected items to download

			let files_list_items = $('.storage ul li'); // Items in user's storage
			let is_selected = false;

			for (let i = 0; i < files_list_items.length; i++) {

				if (files_list_items.eq(i).hasClass('selected')) { // If any item is selected
					is_selected = true;
					break;
				} 
			}

			return is_selected;
		},

		get_selected_items: function() {

			let files_list_items = $('.storage ul li'); // Items in user's storage
			let items_array = [];
			let download_path = processing.parse_path_into_string(current_path);

			for (let i = 0; i < files_list_items.length; i++) {

				if (files_list_items.eq(i).hasClass('selected')) { // If any item is selected
					
					items_array.push(files_list_items.eq(i).children().children('.storage-element').eq(0).text()); // Pushing it's name to the array with selected items
				} 
			}

			let items = {
				path: user_email + download_path,
				items: items_array
			};

			return items;
		},

		update_button_status: function() { // Update download button (change it's active status)

			let is_selected = this.check_selected_items();

			if (is_selected) { // If any item is selected -> make download button active
				
				if (download_button.hasClass('unactive')) {
					download_button.removeClass('unactive');
				}
			} else { // If none of items is selected -> make button unactive

				if (!download_button.hasClass('unactive')) {
					download_button.addClass('unactive');	
				}	
			}
		}
	};

	const directory = { // Functions to work with directory

		change_directory: function(new_directory) { // Function that changes user's current directory

			if (new_directory !== '..') { // If user is moving to the subfolder

				current_path.push(`${new_directory}/`); // Changing current path to a new path

			} else { // If user is moving to the parental folder
				
				current_path.splice(-1, 1); // Deleting last element of current path array (moving to the parental folder)
			}

			let current_path_string = processing.parse_path_into_string(current_path); // Parse current path array into string format

			this.update_info(current_path_string); // Update current path on the page and clear storage files list

			return current_path_string;
		},

		update_info: function(new_path) { // Function that updates current path on the page and clear storage files list

			path_paragraph.text(`path: ${new_path}`); // Changing user's current path shown at the page

			files_list.text(''); // Clearing user's storage at the page
		}
	};

	const processing = { // Functions for processing some data

		parse_path_into_string: function(path) { // Function that parses path array into string format
		
			let path_string = '';

			for (let i = 0; i < path.length; i++) { // Adding every path array item to string
				path_string += path[i]; 
			}

			return path_string;
		}
	};

	// Click events
	files_list.on('click', 'li', function() { // Click at the storage item

		if (this.classList[0] === 'folder') { // Clicked item is a folder

			let folder_name = $(this).children().children('.storage-element').eq(0).text(); // Clicked folder name

			socket.emit('show_directory', { path: user_email + directory.change_directory(folder_name) }); // Go to this folder
		}
	});

	files_list.on('click', 'input', function(event) { // Click at the checkbox button

		if(this.checked) { // User selected an item

			$(this).closest('li').addClass('selected'); // Add selected class to the parental li element
		} else { // User unselected an item
			
			$(this).closest('li').removeClass('selected'); // Remove selected class of the parental li element
		}

		download.update_button_status();

		if (!event) { // Prevent click event for parental li element (storage item)
			event = window.event;
		}
    	event.cancelBubble = true;
    	if (event.stopPropagation) event.stopPropagation();
	});

	download_button.on('click', function(event) { // Click at the downloading button

		if (!$(this).hasClass('unactive')) { // If any items are selected
			
			let items = download.get_selected_items(); // Getting an object with the current path and the array with selected items   
			console.dir(items);
		}
	});

	// Socket.io
	socket.on('show_directory', function(data) { // Show directory event handler

		if (current_path.length > 1) { // If new folder isn't a root directory

			files_list.append(`<li class="folder"><label><div class="storage-element">..</div></label></li>`); // Add an item of the parental folder '..'
		}

		for (let i = 0; i < data.items.length; i++) { // Append every sent item in the storage div
			
			files_list.append(`<li class="${data.items[i].type}"><label><input type="checkbox"><div class="storage-element">${data.items[i].name}</div></label></li>`);
		}

		download.update_button_status();
	});
});