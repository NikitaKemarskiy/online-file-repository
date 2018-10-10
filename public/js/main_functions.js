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

		return is_selected; // Returns true if there're any selected items or false if there aren't any selected items
	},

	get_selected_items: function(current_path, user_email) { // Function that returns an array with selected items data

		let download_path = processing.parse_path_into_string(current_path);
		let files_list_items = $('.storage ul li'); // Items in user's storage
		let items_array = [];
		let item_type = '';

		for (let i = 0; i < files_list_items.length; i++) {

			if (files_list_items.eq(i).hasClass('selected')) { // If any item is selected
				
				if (files_list_items.eq(i).hasClass('folder')) { // If item selected item is a folder -> item type is a folder
					item_type = 'folder';
				} else { // Else -> item type is a file
					item_type = 'file';
				}

				items_array.push({ // Pushing info about item to the array with selected items
					item_name: files_list_items.eq(i).children().children('.storage-element').eq(0).text(), // Item name
					item_type: item_type // Item type (folder or file)
				});
			} 
		}

		let items = {
			email: user_email,
			path: download_path,
			items: items_array
		};

		return items;
	},

	unselect_items: function() { // Function that makes all the selected items unselected

		let files_list_items = $('.storage ul li'); // Items in the user's storage

		for (let i = 0; i < files_list_items.length; i++) {

			if (files_list_items.eq(i).hasClass('selected')) { // If any item is selected
				files_list_items.eq(i).removeClass('selected');
			} 
		}

		this.uncheck_checkboxes(); // Unchecking all the checked checkboxes
	},

	uncheck_checkboxes: function() { // Function that makes all the checked checkboxes unchecked

		let files_list_checkboxes = $('.storage ul li input'); // Checkboxes in the user's storage

		for (let i = 0; i < files_list_checkboxes.length; i++) {

			if (files_list_checkboxes.eq(i).prop('checked')) { // If checkbox is checked -> uncheck it
				files_list_checkboxes.eq(i).prop('checked', false);
			}
		}
	},

	change_checkbox_status: function(checkbox) {

		if(checkbox.checked) { // User selected an item

			$(checkbox).closest('li').addClass('selected'); // Add selected class to the parental li element
		} else { // User unselected an item
			
			$(checkbox).closest('li').removeClass('selected'); // Remove selected class of the parental li element
		}
	},

	update_button_status: function(download_button) { // Update download button (change it's active status)

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

	change_directory: function(new_directory, current_path, path_paragraph, files_list) { // Function that changes user's current directory

		if (new_directory !== '..') { // If user is moving to the subfolder

			current_path.push(`${new_directory}/`); // Changing current path to a new path

		} else { // If user is moving to the parental folder
			
			current_path.splice(-1, 1); // Deleting last element of current path array (moving to the parental folder)
		}

		let current_path_string = processing.parse_path_into_string(current_path); // Parse current path array into string format

		this.update_info(current_path_string, path_paragraph, files_list); // Update current path on the page and clear storage files list

		return current_path_string;
	},

	update_info: function(new_path, path_paragraph, files_list) { // Function that updates current path on the page and clear storage files list

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
	},

	prevent_click_for_parental_element: function(event) {

		if (!event) { // Prevent click event for parental li element (storage item)
			event = window.event;
		}
    	event.cancelBubble = true;
    	if (event.stopPropagation) event.stopPropagation();
	}
};