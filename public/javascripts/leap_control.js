/*

LEAP performance tweak: 1. reduce the frame rate of leap motion. 2. elimate all html content set in loops

*/

var ws;
var leap_y = 0; // Leap motion's y coord
var leap_x = 0; // Leap motion's x coord
var leap_x_previous = leap_x;
var leap_screen_y = 0;
var leap_screen_x = 0;
var leap_screen_y_previous = leap_screen_y;
var leap_trigger = false;
var movement_speedup = 2;
var message_counter = 0;
// sample rate from leap's socket server
var message_rate = 5;
var allow_instrument_switch = true;

// Support both the WebSocket and MozWebSocket objects
if ((typeof(WebSocket) == 'undefined') &&
    (typeof(MozWebSocket) != 'undefined')) {
  WebSocket = MozWebSocket;
}

$(document).ready(function(){
  leap_screen_x = $(document).width()/2;
})
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
    message_counter += 1;
    // we only sample using a fixed rate from leap's socket server to reduce computation cost
    if(message_counter % message_rate !=0) return;
    var obj = JSON.parse(event.data);
    if(typeof obj.pointables !== "undefined" && typeof obj.pointables[0] !== "undefined"){
    	var tip = obj.pointables[0].tipPosition;
    	//document.getElementById("leap_status").innerHTML = '<pre>' + tip[0] +"<br/>"+tip[1]+"<br/>"+tip[2]+ '</pre>';
    	leap_y = tip[1];
      leap_x = tip[0];
      // detect swtiching instrument
      if(Math.abs(leap_x-leap_x_previous)>20 && allow_instrument_switch == true){
        //console.log("drastic horizontal movement: "+ (leap_x-leap_x_previous));
        leap_select_sound(leap_x_previous-leap_x);
        allow_instrument_switch = false;
        setTimeout(function(){
          allow_instrument_switch = true;
        },1000)
      }
    	leap_screen_y = document_height - movement_speedup*document_height*((leap_y-80)/250.0);
    	if(Math.abs(leap_screen_y_previous - leap_y) > 0.1){
    		leap_move(); // fire move only when finger actually move
    		$("#leap_circle").css({left:leap_screen_x,top:leap_screen_y});
    	}
      // setup local gain value
      local_gain_value = ((tip[2]/50) < 0)? (tip[2]/50) : 0;
    	if(leap_trigger == false && tip[2] < 0){
    		leap_trigger = true;
    		leap_start_sound();		
    	}else if (leap_trigger == true && tip[2] > 0){
    		leap_trigger = false;
    		leap_stop_sound();
    	}
      leap_x_previous = leap_x;
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