var ad_context; // this is the audio context
var buffer_loader; // object contaning all buffer of sounds
var buffer_list_playable;
var local_buffer_player;
var local_sound_interval_timeout;
var local_sound_choice = 0;
// sound source has all the sounds for the app
var sound_source = [
      'sound/bziaou_1.ogg',
      'sound/bziaou_2.ogg',
      'sound/bziaou_3.ogg',
      'sound/bziaou_4.ogg',
      'sound/bziaou_5.ogg',
      'sound/bziaou_6.ogg',
      'sound/bziaou_7.ogg',
      'sound/bziaou_8.ogg',
      'sound/bziaou_9.ogg',
      'sound/bziaou_10.ogg',
      'sound/bziaou_11.ogg',
      'sound/bziaou_12.ogg',
      'sound/bziaou_13.ogg',
      'sound/bziaou_14.ogg',
      'sound/bziaou_15.ogg',
      'sound/bziaou_16.ogg',
      'sound/syntklocka_stab_1.ogg',
      'sound/syntklocka_stab_2.ogg',
      'sound/syntklocka_stab_3.ogg',
      'sound/syntklocka_stab_4.ogg',
      'sound/syntklocka_stab_5.ogg',
      'sound/syntklocka_stab_6.ogg',
      'sound/syntklocka_stab_7.ogg',
      'sound/syntklocka_stab_8.ogg',
      'sound/syntklocka_stab_9.ogg',
      'sound/syntklocka_stab_10.ogg',
      'sound/syntklocka_stab_11.ogg',
      'sound/syntklocka_stab_12.ogg',
      'sound/syntklocka_stab_13.ogg',
      'sound/syntklocka_stab_14.ogg',
      'sound/syntklocka_stab_15.ogg',
      'sound/syntklocka_stab_16.ogg',
      'sound/8bit_stab_1.ogg',
      'sound/8bit_stab_2.ogg',
      'sound/8bit_stab_3.ogg',
      'sound/8bit_stab_4.ogg',
      'sound/8bit_stab_5.ogg',
      'sound/8bit_stab_6.ogg',
      'sound/8bit_stab_7.ogg',
      'sound/8bit_stab_8.ogg',
      'sound/8bit_stab_9.ogg',
      'sound/8bit_stab_10.ogg',
      'sound/8bit_stab_11.ogg',
      'sound/8bit_stab_12.ogg',
      'sound/8bit_stab_13.ogg',
      'sound/8bit_stab_14.ogg',
      'sound/8bit_stab_15.ogg',
      'sound/8bit_stab_16.ogg',
      'sound/bassdist_1.ogg',
      'sound/bassdist_2.ogg',
      'sound/bassdist_3.ogg',
      'sound/bassdist_4.ogg',
      'sound/bassdist_5.ogg',
      'sound/bassdist_6.ogg',
      'sound/bassdist_7.ogg',
      'sound/bassdist_8.ogg',
      'sound/bassdist_9.ogg',
      'sound/bassdist_10.ogg',
      'sound/bassdist_11.ogg',
      'sound/bassdist_12.ogg',
      'sound/bassdist_13.ogg',
      'sound/bassdist_14.ogg',
      'sound/bassdist_15.ogg',
      'sound/bassdist_16.ogg',
      'sound/syntklocka_stab_1.ogg',
      'sound/syntklocka_stab_2.ogg',
      'sound/syntklocka_stab_3.ogg',
      'sound/syntklocka_stab_4.ogg',
      'sound/syntklocka_stab_5.ogg',
      'sound/syntklocka_stab_6.ogg',
      'sound/syntklocka_stab_7.ogg',
      'sound/syntklocka_stab_8.ogg',
      'sound/syntklocka_stab_9.ogg',
      'sound/syntklocka_stab_10.ogg',
      'sound/syntklocka_stab_11.ogg',
      'sound/syntklocka_stab_12.ogg',
      'sound/syntklocka_stab_13.ogg',
      'sound/syntklocka_stab_14.ogg',
      'sound/syntklocka_stab_15.ogg',
      'sound/syntklocka_stab_16.ogg'
    ];
var document_height;
var mouse_doc_x, mouse_doc_y;
var socket;
var my_id = Math.random().toString(36).substring(7);

// for other players connected to the game
var other_player_info = {}; // contains information for other players including sound choice, time interval, buffer player, and mouse coord

function create_audio_context(){
  try {
    ad_context = new webkitAudioContext();
    console.log("Audio context initiated");
    buffer_loader = new BufferLoader(ad_context,sound_source,buffer_loading_finished);
    buffer_loader.load();
    console.log("Buffer loader finished loading");
  }
  catch(e) {
    alert('Web Audio API is not supported in this browser and no sound will be played');
  }
}

// trigger then buffer of all audio clips are loaded completely
function buffer_loading_finished(bufferList) {
  console.log("Buffer loader compplete - loaded " + sound_source.length + " sounds");
  buffer_list_playable = bufferList;
  $("#loading").fadeOut();
  initialize_socket();
  attach_mouse_events();
  attach_key_events();
}

// play a particular sound clip with a playlist, and the index in the playlist
function local_play(playlist,index){
  if(typeof local_buffer_player !== "undefined"){
    local_buffer_player.stop(0);
  }
  local_buffer_player = ad_context.createBufferSource();
  local_buffer_player.buffer = playlist[index];
  local_buffer_player.connect(ad_context.destination);
  local_buffer_player.start(0);
  add_circle(mouse_doc_x - $(canvas).position().left,
    mouse_doc_y - $(canvas).position().top,
    circle_r * (0.5 + Math.random()));
}

// play a particular sound clip for a remote player with a playlist, and the index in the playlist
function remote_play(player_id, playlist,index){
  if(typeof other_player_info[player_id].player !== "undefined"){
    other_player_info[player_id].player.stop(0);
  }
  other_player_info[player_id].player = ad_context.createBufferSource();
  other_player_info[player_id].player.buffer = playlist[index];
  other_player_info[player_id].player.connect(ad_context.destination);
  other_player_info[player_id].player.start(0);
}

// play the music stream for local player
function local_player_play_stream(){
  // first play once then setup interval to avoid delay
  local_play(buffer_list_playable,local_sound_choice*16+Math.floor(16*(mouse_doc_y)/document_height));
  local_sound_interval_timeout = setInterval(function(){
    local_play(buffer_list_playable,local_sound_choice*16+Math.floor(16*(mouse_doc_y)/document_height));
  },170);
}

// clear music
function clear_local_sound_time_out(){
  window.clearInterval(local_sound_interval_timeout);
}

// attach mouse events to the dom
function attach_mouse_events(){
  document_height = $(document).height();
  $(document).mousemove(function(e){
    $('#status').html(e.pageX +', '+ e.pageY);
    mouse_doc_x = e.pageX;
    mouse_doc_y = e.pageY;
    $("#my_circle").css({top:mouse_doc_y-10,left:mouse_doc_x-10});
    socket.emit('user-motion', {id:my_id,x:mouse_doc_x,y:mouse_doc_y,c:local_sound_choice});
  });
  $(document).mousedown(function(e){
    console.log("mouse down");
    socket.emit('user-mousedown', {id:my_id,x:mouse_doc_x,y:mouse_doc_y,c:local_sound_choice});
    local_player_play_stream();
  });
  $(document).mouseup(function(e){
    console.log("mouse up");
    socket.emit('user-mouseup', {id:my_id,x:mouse_doc_x,y:mouse_doc_y,c:local_sound_choice});
    clear_local_sound_time_out();
  });
}

// leap functions
function leap_start_sound(){
  console.log("leap start");
  socket.emit('user-mousedown', {id:my_id,x:leap_screen_x,y:leap_screen_y,c:local_sound_choice});
  local_player_play_stream();
}
function leap_stop_sound(){
  console.log("leap stop");
  socket.emit('user-mouseup', {id:my_id,x:leap_screen_x,y:leap_screen_y,c:local_sound_choice});
  clear_local_sound_time_out();
}
function leap_move(){
  // override mouse position
  mouse_doc_x = leap_screen_x;
  mouse_doc_y = leap_screen_y;
  socket.emit('user-motion', {id:my_id,x:mouse_doc_x,y:mouse_doc_y,c:local_sound_choice});
}



// attach keyboard event to the dom
function attach_key_events(){
  $(document).keypress(function(e) {
    console.log("Key pressed: " + e.which);
    $(".select_sound").removeClass("sel_highlighted");
    switch(e.which){
      case 49:
        local_sound_choice = 0;
        $("#sound_1").addClass("sel_highlighted");
        break;
      case 50:
        local_sound_choice = 1;
        $("#sound_2").addClass("sel_highlighted");
        break;
      case 51:
        local_sound_choice = 2;
        $("#sound_3").addClass("sel_highlighted");
        break;
      case 52:
        local_sound_choice = 3;
        $("#sound_4").addClass("sel_highlighted");
        break;
      case 53:
        local_sound_choice = 4;
        $("#sound_5").addClass("sel_highlighted");
        break;
      default:
    }
  });
}

// initialize web socket to listen to actions from other users
function initialize_socket(){
  socket = io.connect('/game');
  socket.on('other-motion', function (data) {
    if($("#"+data.id).length == 0){
      $("body").append("<div id='"+data.id+"' class='other_circle'></div>")
    }
    if(typeof other_player_info[data.id] === "undefined"){
      other_player_info[data.id] = {};
    }
    other_player_info[data.id].x = data.x;
    other_player_info[data.id].y = data.y;
    other_player_info[data.id].c = data.c;
    $("#"+data.id).css({top:data.y,left:data.x});
  });
  socket.on('other-disconnect', function (data) {
    // data is the id here
    $("#"+data).fadeOut();
    delete other_player_info[data];
  });
  socket.on('other-mousedown', function (data) {
    if(typeof other_player_info[data.id] === "undefined"){
      other_player_info[data.id] = {};
    }
    other_player_info[data.id].c = data.c;
    // TODO: play sound once
    remote_play(data.id,buffer_list_playable,other_player_info[data.id].c*16+Math.floor(16*other_player_info[data.id].y/document_height));
    other_player_info[data.id].interval = setInterval(function(){
      remote_play(data.id,buffer_list_playable,other_player_info[data.id].c*16+Math.floor(16*other_player_info[data.id].y/document_height));
    },170);

  });
  socket.on('other-mouseup', function (data) {
    window.clearInterval(other_player_info[data.id].interval);
  });
}

//generate random color
function get_random_color(){
  var letters = '0123456789ABCDEF'.split('');
  var color = '#00';
  for (var i = 0; i < 4; i++ ) {
      color += letters[Math.round(Math.random() * 15)];
  }
  return color;
}

// buffer loader class
function BufferLoader(context,urlList,callback){this.context=context;this.urlList=urlList;this.onload=callback;this.bufferList=new Array();this.loadCount=0;}
BufferLoader.prototype.loadBuffer=function(url,index){var request=new XMLHttpRequest();request.open("GET",url,true);request.responseType="arraybuffer";var loader=this;request.onload=function(){loader.context.decodeAudioData(request.response,function(buffer){if(!buffer){alert('error decoding file data: '+url);return;}
loader.bufferList[index]=buffer;if(++loader.loadCount==loader.urlList.length)
loader.onload(loader.bufferList);},function(error){console.error('decodeAudioData error',error);});}
request.onerror=function(){alert('BufferLoader: XHR error');}
request.send();}
BufferLoader.prototype.load=function(){for(var i=0;i<this.urlList.length;++i)
this.loadBuffer(this.urlList[i],i);}