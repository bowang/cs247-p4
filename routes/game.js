module.exports = function()
{
	
	var participants_con = {};

	var get_random_color = function(){
	    var letters = '0123456789ABCDEF'.split('');
	    var color = '#00';
	    for (var i = 0; i < 4; i++ ) {
	        color += letters[Math.round(Math.random() * 15)];
	    }
	    return color;
	}

	global.socket.of('/game').on('connection', function(socket) {
		socket.on('user-ready', function(data) {
			//store data into socket
			//socket.name = data.name;
			//socket.color = data.color = get_random_color();
			//participants_con[socket.id] = {};
			//dispatchStatus();
		});

		socket.on('disconnect', function() {
			//delete participants_con[socket.id];
			//dispatchStatus();
			broadcastToAll("other-disconnect",socket.game_id);
		});

		socket.on('user-motion', function(data) {
			//data.color = socket.color;
			//broadcastToSelf('user-message', data);
			//data.color = "#FFFF00";
			socket.game_id = data.id;
			broadcastToAll("other-motion",data);
		});

		socket.on('user-mousedown', function(data) {
			socket.game_id = data.id;
			broadcastToAll("other-mousedown",data);
		});

		socket.on('user-mouseup', function(data) {
			socket.game_id = data.id;
			broadcastToAll("other-mouseup",data);
		});

		//broad cast connection status
		function dispatchStatus(){
			//var i=0; for (p in participants_con) i++;
			//broadcastToAll('status', i);
		}

		//broad cast to self
		function broadcastToSelf(message, data){
			//socket.emit(message, data);
		}

		//broad cast to everyone
		function broadcastToAll(message, data){
			//socket.emit(message, data);
			socket.broadcast.emit(message, data);
		}
	});
}();