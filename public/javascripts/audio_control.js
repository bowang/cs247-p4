var ad_context; // this is the audio context
var buffer_loader; // object contaning all buffer of sounds
var buffer_list_playable;
var sound_interval_timeout;
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
      'sound/bziaou_16.ogg'
    ];
var document_height;
var mouse_doc_x, mouse_doc_y;
var buffer_player;
var socket;
var my_id = Math.random().toString(36).substring(7);

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
}

// play a particular sound clip
function play(index){
  if(typeof buffer_player !== "undefined"){
    buffer_player.stop(0);
  }
  buffer_player = ad_context.createBufferSource();
  buffer_player.buffer = buffer_list_playable[index];
  buffer_player.connect(ad_context.destination);
  buffer_player.start(0);
}

// play the music stream
function play_stream(){
  sound_interval_timeout = setInterval(function(){play(Math.floor(16*mouse_doc_y/document_height));},170);
}

// clear music
function clear_sound_time_out(){
  window.clearInterval(sound_interval_timeout);
}

// attach mouse events to the dom
function attach_mouse_events(){
  document_height = $(document).height();
  $(document).mousemove(function(e){
    $('#status').html(e.pageX +', '+ e.pageY);
    mouse_doc_x = e.pageX;
    mouse_doc_y = e.pageY;
    $("#my_circle").css({top:mouse_doc_y-10,left:mouse_doc_x-10});
    socket.emit('user-motion', {id:my_id,x:mouse_doc_x,y:mouse_doc_y});
  });
  $(document).mousedown(function(e){
    console.log("mouse down");
    play_stream();
  });
  $(document).mouseup(function(e){
    console.log("mouse up");
    clear_sound_time_out();
  });
}

// initialize web socket to listen to actions from other users
function initialize_socket(){
  socket = io.connect('/game');
  socket.on('other-motion', function (data) {
    if($("#"+data.id).length == 0){
      $("body").append("<div id='"+data.id+"' class='other_circle'></div>")
    }
    $("#"+data.id).css({top:data.y,left:data.x});
  });
  socket.on('other-disconnect', function (data) {
    $("#"+data).fadeOut();
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