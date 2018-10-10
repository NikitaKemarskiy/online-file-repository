$(document).ready(function() {

	// Variables
	const socket = io(); // Socket initialization
	const user_email = $('.header-email').eq(0).text().replace(/\s/g, ''); // User's email
	const current_path = ['/']; // Current storage path
	
	// jQuery elements
	const files_list = $('.storage ul').eq(0); // Ul in the storage, which contains li elements (files)
	const path_paragraph = $('.path p').eq(0); // Paragraph which contains path
	const download_button = $('.path .button'); // Button for downloading files

	// Click events
	files_list.on('click', 'li', function() { // Click at the storage item

		if (this.classList[0] === 'folder') { // Clicked item is a folder

			let folder_name = $(this).children().children('.storage-element').eq(0).text(); // Clicked folder name

			socket.emit('show_directory', { path: user_email + directory.change_directory(folder_name, current_path, path_paragraph, files_list) }); // Go to this folder
		}
	});

	files_list.on('click', 'input', function(event) { // Click at the checkbox button

		if(this.checked) { // User selected an item

			$(this).closest('li').addClass('selected'); // Add selected class to the parental li element
		} else { // User unselected an item
			
			$(this).closest('li').removeClass('selected'); // Remove selected class of the parental li element
		}

		download.update_button_status(download_button);

		if (!event) { // Prevent click event for parental li element (storage item)
			event = window.event;
		}
    	event.cancelBubble = true;
    	if (event.stopPropagation) event.stopPropagation();
	});

	download_button.on('click', function(event) { // Click at the downloading button

		if (!$(this).hasClass('unactive')) { // If any items are selected
			
			let items = download.get_selected_items(current_path, user_email); // Getting an object with the current path and the array with selected items   
			
			download.unselect_items();
			download.update_button_status(download_button);
			
			socket.emit('zip_files', items); // Sending items array to make an archive with them
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

		download.update_button_status(download_button);
	});
});