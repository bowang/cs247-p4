var ws;
var leap_y = 0; // Leap motion's y coord
var leap_screen_y = 0;
var leap_screen_x = 300;
var leap_screen_y_previous = leap_screen_y;
var leap_trigger = false;
var movement_speedup = 2;

// Support both the WebSocket and MozWebSocket objects
if ((typeof(WebSocket) == 'undefined') &&
    (typeof(MozWebSocket) != 'undefined')) {
  WebSocket = MozWebSocket;
}

// Create the socket with event handlers and also feed in leap_screen_y to control the sound
function init_leap() {
  //Create and open the socket
  ws = new WebSocket("ws://localhost:6437/");
  
  // On successful connection
  ws.onopen = function(event) {
    document.getElementById("leap_connection").innerHTML = "LEAP: WebSocket connection open!";
  };
  
  // On message received
  ws.onmessage = function(event) {
  	// we do not want to listen so frequently to leap, so let's only listen every few seconds

    var obj = JSON.parse(event.data);
    if(typeof obj.pointables !== "undefined" && typeof obj.pointables[0] !== "undefined"){
    	var tip = obj.pointables[0].tipPosition;
    	document.getElementById("leap_status").innerHTML = '<pre>' + tip[0] +"<br/>"+tip[1]+"<br/>"+tip[2]+ '</pre>';
    	leap_y = tip[1];
    	leap_screen_y = document_height - movement_speedup*document_height*((leap_y-50)/250.0);
    	if(Math.abs(leap_screen_y_previous - leap_y) > 0.1){
    		leap_move(); // fire move only when finger actually move
    		$("#leap_circle").css({left:leap_screen_x,top:leap_screen_y});
    	}
    	if(leap_trigger == false && tip[2] > 0){
    		leap_trigger = true;
    		leap_start_sound();		
    	}else if (leap_trigger == true && tip[2] < 0){
    		leap_trigger = false;
    		leap_stop_sound();
    	}
    	leap_screen_y_previous = leap_y;
    }
  };
  
  // On socket close
  ws.onclose = function(event) {
    ws = null;
    document.getElementById("leap_connection").innerHTML = "LEAP: WebSocket connection closed";
  }
  
  //On socket error
  ws.onerror = function(event) {
    alert("LEAP: received error");
  };
}

