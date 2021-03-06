$(document).ready(function() {

	// Constants
	const socket = io(); // Socket initialization
	const admin_email = $('div.header-email span').eq(0).text().replace(/\s/g, ''); // User's email
	const current_path = ['/']; // Current storage path

	// jQuery selectors
	const email_items = $('div.header ul li.email-item'); 
	const storage_size_block = $('div.header div.header-storage strong').eq(0);
	const upload_block = $('div.upload-block').eq(0);
	const create_folder_block = $('div.create-folder-block').eq(0);
	const create_folder_input = $('div.create-folder-block input').eq(0);
	const create_folder_error_message = $('div.create-folder-block p.error-message').eq(0);
	const create_folder_button_cancel = $('div.create-folder-button.cancel').eq(0);
	const create_folder_button_create = $('div.create-folder-button.create').eq(0);
	const storage = $('div.storage').eq(0);
	const loader_spinner = $('div.path div.animation').eq(0);
	const files_list = $('div.storage ul').eq(0); // Ul in the storage, which contains li elements (files)
	const download_button = $('div.path span.button.download').eq(0); // Button for downloading files
	const delete_button = $('div.path span.button.delete').eq(0); // Button for deleting files
	const folder_button = $('div.path span.button.folder').eq(0); // Button for creating the new folder
	const path_paragraph = $('div.path p').eq(0); // Paragraph which contains path
	const download_form = $('form.download').eq(0); // Form for downloading files
	const delete_form = $('form.delete').eq(0); // Form for deleting files

	// Variables
	let dragenter_counter = 0; // Counter for drag events to prevent dragleave event when hover child elements
	let user_email = admin_email;

	// Click events
	email_items.on('click', function(event) {
		
		// Getting email of the user, which data admin wants to see
		user_email = $(this).text();
		// Changing the email value in header
		$('div.header-email span').eq(0).text(user_email);


		// Go to this user storage
		current_path.splice(1);
		socket.emit('show_directory', { path: user_email + directory.update_directory(current_path, files_list) });
		socket.emit('get_size', user_email);
	});

	files_list.on('click', 'li', function(event) { // Click at the storage item

		if (this.classList[0] === 'folder') { // Clicked item is a folder

			let folder_name = $(this).children().children('div.storage-element').eq(0).text(); // Clicked folder name

			// Go to this folder
			socket.emit('show_directory', { path: user_email + directory.change_directory(folder_name, current_path, path_paragraph, files_list) }); 
		}
	});

	files_list.on('click', 'input', function(event) { // Click at the checkbox button

		download.change_checkbox_status(this); // If checkbox is checked -> add 'selected' class to an item or remove it if checkbox isn't checked
		download.update_button_status(download_button); // Updating download button status (active / unactive) depending on checkboxes
		download.update_button_status(delete_button); // Updating delete button status (active / unactive) depending on checkboxes

		processing.prevent_click_for_parental_element(event); // Preventing click event for parental element
	});

	download_button.on('click', function(event) { // Click at the download button

		if (!$(this).hasClass('unactive')) { // If any items are selected
			
			// Getting an object with the current path and the array with selected items
			let items = download.get_selected_items(current_path, user_email); 
			
			items.items = JSON.stringify(items.items); // Converting items array into JSON string to pass it using POST method
			items.archive_name = (Math.round(Math.random() * 1000000000000)).toString(); // Generating the archive unique name

			download.unselect_items(); // Unselect all the selected items
			download.update_button_status(download_button); // Updating downlad button status (active / unactive)
			download.update_button_status(delete_button); // Updating delete button status (active / unactive)

			download_form.children('input.email').eq(0).val(items.email); // Filling the download form with data for download
			download_form.children('input.path').eq(0).val(items.path);
			download_form.children('input.items').eq(0).val(items.items);
			download_form.children('input.archive_name').eq(0).val(items.archive_name);
			download_form.submit(); // Submiting this form using the POST method
		}
	});

	delete_button.on('click', function(event) { // Click at the delete button

		if (!$(this).hasClass('unactive')) { // If any items are selected
			
			// Getting an object with the current path and the array with selected items
			let items = download.get_selected_items(current_path, user_email); 
			
			items.items = JSON.stringify(items.items); // Converting items array into JSON string to pass it using POST method

			download.unselect_items(); // Unselect all the selected items
			download.update_button_status(download_button); // Updating download button status (active / unactive)
			download.update_button_status(delete_button); // Updating delete button status (active / unactive)


			socket.emit('delete_items', items);
		}
	});

	folder_button.on('click', function(event) { // Click at the create folder button
		create_folder_block.removeClass('unvisible');
	});

	create_folder_button_cancel.on('click', function(event) { // Click at the cancel creating folder button
		if (!create_folder_block.hasClass('unvisible')) {
			create_folder_input.val(''); // Clearing input for the new folder name
			create_folder_block.addClass('unvisible'); // Making create folder window invisible
			create_folder_input.removeClass('error'); // Making input for the new folder name clear (without error styles)
			create_folder_error_message.addClass('unvisible'); // Making error message paragraph invisible
		}
	});

	create_folder_button_create.on('click', function(event) { // Click at the create folder with specified name button
		if (!create_folder_block.hasClass('unvisible')) {

			let folder_name = create_folder_input.val(); // Getting the new folder name
			let create_folder_path = processing.parse_path_into_string(current_path);
			
			// Folder name is longer than 64 or forbidden symbols are in it
			if (processing.check_forbidden_symbols(folder_name) || folder_name.length > 64 || folder_name.length < 1) {  
				create_folder_input.addClass('error'); // Applying error styles for the input
				create_folder_error_message.removeClass('unvisible'); // Making error message paragraph visible
			} else { // Forbidden symbols weren't found -> new folder name is ok
				create_folder_input.removeClass('error'); // Making input for the new folder name clear (without error styles)
				create_folder_error_message.addClass('unvisible'); // Making error message paragraph invisible
				create_folder_input.val(''); // Clearing the input for the new folder name
				create_folder_block.addClass('unvisible'); // Making create folder window invisible

				// Emitting socket event for creating the new folder
				socket.emit('create_folder', { email: user_email, path: create_folder_path, folder_name: folder_name });
			}
		}
	});

	// Drag events for uploading files
	storage.on('drag dragstart dragend dragover dragenter dragleave drop', function(event) {
			event.preventDefault();
	    	event.stopPropagation();
		})
		.on('dragover dragenter', function() {
			upload_block.removeClass('unvisible');
		})
		.on('dragenter', function(event) {
			dragenter_counter++; // Incrementing drag counter
		})
		.on('dragleave', function() {
			dragenter_counter--; // Decrementing drag counter
			// If dragleave occured to storage window -> make "drag and drop" window invisible
			if (dragenter_counter <= 0) { 
			  	upload_block.addClass('unvisible');
			}
		})
		.on('drop', function(event) {
			upload_block.addClass('unvisible');
			dragenter_counter = 0; 
			loader_spinner.css('display', 'block'); // Enable animation spinner

			let files = event.originalEvent.dataTransfer.files; // Getting dropped files
			// Creating form data with files to upload
			let formData = processing.create_upload_form_data(current_path, user_email, files); 

			$.ajax({ // Sending created form data using POST method
		        type: "POST",
		        enctype: 'multipart/form-data',
		        url: "/files/upload",
		        data: formData, // Form data with info for uploading and files
		        processData: false, // Prevent jQuery from automatically transforming the data into a query string
		        contentType: false, // Prevent jQuery from setting Content-Type header
		        cache: false, // Prevent browser from caching response page
		        success: (data) => { // Files were successfully uploaded 
		        	// Update the folder to see new data
		            socket.emit('show_directory', { path: user_email + directory.update_directory(current_path, files_list) });
		            socket.emit('get_size', user_email); 
		            loader_spinner.css('display', 'none'); // Stop animation spinner
		        }, 
		        error: (error) => { // Error occured on server
		           	alert('Error uploading files');
		           	loader_spinner.css('display', 'none'); // Stop animation spinner
		        }
			});
		});


	// Socket.io
	socket.on('show_directory', function(data) { // Show directory event handler

		if (current_path.length > 1) { // If new folder isn't a root directory
			// Add an item of the parental folder '..'
			files_list.append(`<li class="folder"><label><div class="storage-element">..</div></label></li>`); 
		}

		for (let i = 0; i < data.items.length; i++) { // Append every sent item in the storage div
			files_list.append(`<li class="${data.items[i].type}"><label><input type="checkbox"><div class="storage-element">${data.items[i].name}</div></label></li>`);
		}

		download.update_button_status(download_button); // Updating download button status (active / unactive)
		download.update_button_status(delete_button); // Updating delete button status (active / unactive)
	});

	socket.on('folder_created', function(data) {
		// Update the folder to see new data
		socket.emit('show_directory', { path: user_email + directory.update_directory(current_path, files_list) });
	});

	socket.on('items_deleted', function(data) { // Items successfully deleted event handler
		// Update the folder to see new data
		socket.emit('show_directory', { path: user_email + directory.update_directory(current_path, files_list) });
		socket.emit('get_size', user_email);
	});

	socket.on('get_size', function(size) { // Size of user's storage was received
		storage_size_block.text(size);
	});
});