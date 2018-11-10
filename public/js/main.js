$(document).ready(function() {

	// Constants
	const socket = io(); // Socket initialization
	const user_email = $('.header-email').eq(0).text().replace(/\s/g, ''); // User's email
	const current_path = ['/']; // Current storage path

	// jQuery elements
	const upload_block = $('.upload-block').eq(0);
	const storage = $('.storage').eq(0);
	const files_list = $('.storage ul').eq(0); // Ul in the storage, which contains li elements (files)
	const download_button = $('.path .button.download').eq(0); // Button for downloading files
	const delete_button = $('.path .button.delete').eq(0); // Button for deleting files
	const path_paragraph = $('.path p').eq(0); // Paragraph which contains path
	const download_form = $('form.download').eq(0); // Form for downloading files
	const delete_form = $('form.delete').eq(0); // Form for deleting files

	// Variables
	let dragenter_counter = 0;

	// Click events
	files_list.on('click', 'li', function() { // Click at the storage item

		if (this.classList[0] === 'folder') { // Clicked item is a folder

			let folder_name = $(this).children().children('.storage-element').eq(0).text(); // Clicked folder name

			socket.emit('show_directory', { path: user_email + directory.change_directory(folder_name, current_path, path_paragraph, files_list) }); // Go to this folder
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
			items.archive_name = user_email + '.' + Math.round(Math.random() * 1000000000); // Generating the archive unique name

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

	storage.on('drag dragstart dragend dragover dragenter dragleave drop', function(event) {
			event.preventDefault();
	    	event.stopPropagation();
		})
		.on('dragover dragenter', function() {
			upload_block.removeClass('unvisible');
		})
		.on('dragenter', function(event) {
			dragenter_counter++;
		})
		.on('dragleave', function() {
			dragenter_counter--;
			if (dragenter_counter <= 0) {
				upload_block.addClass('unvisible');
			}
		})
		.on('drop', function(event) {
			
			upload_block.addClass('unvisible');
			dragenter_counter = 0;
			
			let files = event.originalEvent.dataTransfer.files; // Getting dropped files
			let formData = processing.create_upload_form_data(current_path, user_email, files); // Creating form data with files to upload
			
			console.dir(formData);

			$.ajax({ // Sending created form data using POST method
		        type: "POST",
		        enctype: 'multipart/form-data',
		        url: "/files/upload",
		        data: formData,
		        processData: false, //prevent jQuery from automatically transforming the data into a query string
		        contentType: false, // prevent jQuery from setting Content-Type header
		        cache: false, // prevent browser from caching response page
		        success: (data) => {
		            socket.emit('show_directory', { path: user_email + directory.update_directory(current_path, files_list) }); // Go to this folder
		        },
		        error: (error) => {
		           	console.error(`Error: ${error.message}`);
		        }
			});
		});


	// Socket.io
	socket.on('show_directory', function(data) { // Show directory event handler

		if (current_path.length > 1) { // If new folder isn't a root directory

			files_list.append(`<li class="folder"><label><div class="storage-element">..</div></label></li>`); // Add an item of the parental folder '..'
		}

		for (let i = 0; i < data.items.length; i++) { // Append every sent item in the storage div
			
			files_list.append(`<li class="${data.items[i].type}"><label><input type="checkbox"><div class="storage-element">${data.items[i].name}</div></label></li>`);
		}

		download.update_button_status(download_button); // Updating download button status (active / unactive)
		download.update_button_status(delete_button); // Updating delete button status (active / unactive)
	});

	socket.on('items_deleted', function(data) { // Items successfully deleted event handler

		socket.emit('show_directory', { path: user_email + directory.update_directory(current_path, files_list) }); // Go to this folder
	});
});