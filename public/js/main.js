$(document).ready(function() {

	// Constants
	const socket = io(); // Socket initialization
	const user_email = $('.header-email').eq(0).text().replace(/\s/g, ''); // User's email
	const current_path = ['/']; // Current storage path

	// jQuery elements
	const files_list = $('.storage ul').eq(0); // Ul in the storage, which contains li elements (files)
	const download_button = $('.path .button'); // Button for downloading files
	const path_paragraph = $('.path p').eq(0); // Paragraph which contains path
	const download_form = $('form.download').eq(0);

	// Click events
	files_list.on('click', 'li', function() { // Click at the storage item

		if (this.classList[0] === 'folder') { // Clicked item is a folder

			let folder_name = $(this).children().children('.storage-element').eq(0).text(); // Clicked folder name

			socket.emit('show_directory', { path: user_email + directory.change_directory(folder_name, current_path, path_paragraph, files_list) }); // Go to this folder
		}
	});

	files_list.on('click', 'input', function(event) { // Click at the checkbox button

		download.change_checkbox_status(this); // If checkbox is checked -> add 'selected' class to an item or remove it if checkbox isn't checked
		download.update_button_status(download_button); // Updating button status (active / unactive) depending on checkboxes

		processing.prevent_click_for_parental_element(event); // Preventing click event for parental element
	});

	download_button.on('click', function(event) { // Click at the downloading button

		if (!$(this).hasClass('unactive')) { // If any items are selected
			
			let items = download.get_selected_items(current_path, user_email); // Getting an object with the current path and the array with selected items   
			items.items = JSON.stringify(items.items); // Converting items array into JSON string to pass it using POST method

			download.unselect_items(); // Unselect all the selected items
			download.update_button_status(download_button); // Updating button status (active / unactive)

			download_form.children('input.email').eq(0).val(items.email); // Filling the download form with data for download
			download_form.children('input.path').eq(0).val(items.path);
			download_form.children('input.items').eq(0).val(items.items);
			download_form.children('input.archive_name').eq(0).val(items.archive_name);
			download_form.submit(); // Submiting this form with a POST method
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