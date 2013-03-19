/*

LEAP performance tweak: 1. reduce the frame rate of leap motion. 2. elimate all html content set in loops

*/

var ws;
var leap_y = 0; // Leap motion's y coord
var leap_x = 0; // Leap motion's x coord
var leap_x_previous = leap_x;
var leap_y_previous = leap_y;
var leap_screen_y = 0;
var leap_screen_x = 0;
var leap_screen_y_previous = leap_screen_y;
var leap_trigger = false;
var movement_speedup = 2;
var message_counter = 0;
// sample rate from leap's socket server
var message_rate = 5;
var allow_instrument_switch = true;
var sel_timeout;
var cat_selection = true;
var next_tutorial = "show_tutorial()";
var tutorial_started = false;
var down_motion_counter = 0; // count the distance of pressing fingures
var down_motion_stall = -40; // to help prevent multiple pressing down gestuer at the same time

// Support both the WebSocket and MozWebSocket objects
if ((typeof(WebSocket) == 'undefined') &&
    (typeof(MozWebSocket) != 'undefined')) {
  WebSocket = MozWebSocket;
}

$(document).ready(function(){
  leap_screen_x = $(document).width() * 0.85 - Math.random()*200;
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
    // message_counter += 1;
    // we only sample using a fixed rate from leap's socket server to reduce computation cost
    // if(message_counter % message_rate !=0) return;
    var obj = JSON.parse(event.data);
    if(typeof obj.pointables !== "undefined" && typeof obj.pointables[0] !== "undefined"){
      if(cat_selection){
         var tip = obj.pointables[0].tipPosition;
         leap_x = tip[0];
         leap_y = tip[1];
         if(down_motion_stall >= 0 && leap_y - leap_y_previous < -2){
          down_motion_counter += 1;
          console.log("swiped down");
         }
         if(!tutorial_started){
          var cat_sel = Math.floor((leap_x*0.1+100)/cats.length);
          my_cat_flow.moveTo(cat_sel);
         }
         if(down_motion_counter > 15 ){
            down_motion_counter = 0;
            down_motion_stall = -40;
            eval(next_tutorial);
         }
         down_motion_stall += 1;
         leap_y_previous = leap_y;
      }else{
        $("#leap_circle").show();
        $("#my_circle").hide();
        var tip = obj.pointables[0].tipPosition;
        //document.getElementById("leap_status").innerHTML = '<pre>' + tip[0] +"<br/>"+tip[1]+"<br/>"+tip[2]+ '</pre>';
        leap_y = tip[1];
        leap_x = tip[0];
        // detect swtiching instrument

        if(obj.pointables.length == 5){
          leap_x = (obj.pointables[0].tipPosition[0]+obj.pointables[1].tipPosition[0]+obj.pointables[2].tipPosition[0]+obj.pointables[3].tipPosition[0]+obj.pointables[4].tipPosition[0])/5;
            //console.log("Enter selection mode");
            leap_select_sound(leap_x);
            $("#instrument_switch").css({"background":colors[local_sound_choice]}).show();
            $("#instrument_switch img").attr("src","images/instruments/instrument_"+parseInt(local_sound_choice+1) + ".png");
          return;
        }else{
          $("#instrument_switch").fadeOut(200);
        }
        // if(Math.abs(leap_x-leap_x_previous)>40 && allow_instrument_switch == true){
        //   //console.log("drastic horizontal movement: "+ (leap_x-leap_x_previous));
        //   leap_select_sound(leap_x_previous-leap_x);
        //   allow_instrument_switch = false;
        //   setTimeout(function(){
        //     allow_instrument_switch = true;
        //   },1000);
        //   $("#instrument_switch").css({"background":colors[local_sound_choice]});
        //   $("#instrument_switch").text(local_sound_choice+1).show();
        //   setTimeout(function(){
        //     $("#instrument_switch").fadeOut(200);
        //   },500)
        // }

        // unlock the x position of leap
        leap_screen_y = document_height - movement_speedup*document_height*((leap_y-150)/250.0);

        //  leap free play mode
        //  leap_select_sound(leap_x);

        //  leap_screen_x = document_width - movement_speedup*document_width*((80-leap_x)/250.0);
        //  if(leap_screen_x < 50){
        //    leap_screen_x = 50;
        //  }else if(leap_screen_x > document_width){
        //    leap_screen_x = document_width - 100;
        //  }

        if(local_gain_value <= 0.1){
         $("#note").html("<span class='bigger'>Move finger forward to increase volume.</span>").show();
        }else if(leap_screen_y < 0){
         $("#note").html("<span class='bigger'>Move your finger down.</span>").show();
        }else if(leap_screen_y > document_height){
         $("#note").html("<span class='bigger'>Move your finger up.</span>").show();
        }else{
         $("#note").fadeOut();
        }

        if(Math.abs(leap_screen_y_previous - leap_y) > 0.1){
          leap_move(); // fire move only when finger actually move
          $("#leap_circle").css({left:leap_screen_x,top:leap_screen_y});
        }
        // setup local gain value
        local_gain_value = (tip[2] < 60)? 1-tip[2]/60 : 0;
        if(leap_trigger == false && tip[2] < 60){
          leap_trigger = true;
          leap_start_sound();   
        }else if (leap_trigger == true && tip[2] > 60){
          leap_trigger = false;
          leap_stop_sound();
        }
        leap_x_previous = leap_x;
        leap_screen_y_previous = leap_y;
      }
    }else{
      if(!cat_selection) $("#note").html("<span class='bigger'>Move your finger closer to LEAP.</span>").show();
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


function show_tutorial(){
  tutorial_started = true;
  next_tutorial = "show_tutorial_2()";
  $("#tutorial").show();
  $("#loading").html("");
  $("#note").html("Instruction 1/3 <br/><span class='bigger'> Swipe your finger down to continue</span>");
  $("#cat_select").hide();
  $("#t1").show();
  $("#tutorial").click(function(){
    show_tutorial_2();
  });
}

function show_tutorial_2(){
  next_tutorial = "show_tutorial_3()";
    $("#t1").hide();
    $("#t2").show();
    $("#note").html("Instruction 2/3 <br/><span class='bigger'> Swipe your finger down to continue</span>");
    $("#tutorial").unbind().click(function(){
        show_tutorial_3();
    });
}

function show_tutorial_3(){
  next_tutorial = "ready_to_start()";
    $("#t2").hide();
    $("#t3").show();
    $("#note").html("Instruction 3/3 <br/><span class='bigger'> Swipe your finger down to continue</span>");
    $("#tutorial").unbind().click(function(){
        ready_to_start();
    });
}

function leap_select_sound(x){
    if(x>60){
      local_sound_choice = 8;
    }else if(x>45){
      local_sound_choice = 7;
    }else if(x>30){
      local_sound_choice = 6;
    }else if(x>15){
      local_sound_choice = 5;
    }else if(x>0){
      local_sound_choice = 4;
    }else if(x>-15){
      local_sound_choice = 3;
    }else if(x>-30){
      local_sound_choice = 2;
    }else if(x>-45){
      local_sound_choice = 1;
    }else{
      local_sound_choice = 0;
    }
    $(".select_sound").removeClass("sel_highlighted");
    $("#sound_"+(local_sound_choice+1)).addClass("sel_highlighted");
}
