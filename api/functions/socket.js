// Functions
const connection = function(socket) {

	console.log(`User was connected -> ${socket.id}`);
}

// Exports
module.exports.connection = connection;