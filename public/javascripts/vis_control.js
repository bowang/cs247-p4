var ctx;
var canvas;
var refresh_interval = 15;
var circle_r = 5;
var note_r = 60;
var note_speed_x = 3;
var notes = new Array();
var clouds = new Array();
var colors = ["#ff0000","#ff5a00","#ffbf00","#edf921","#46da00","#00b3da","#216af9","#6721f9","#d021f9"];
var color_strokes = ["#ff4444","#ff5a44","#ffbf44","#ffbf00","#46da88","#00b388","#216a88","#672188","#d02188"];
var cats = [
        //["cat.gif",-50]
        ["GBG.gif",-50],
        ["GBauthentic.gif",-50],
        ["america.gif",-50],
        ["bday.gif",-130],
        ["easter.gif",-50],
        ["fat.gif",-50],
        ["ganja.gif",-50],
        ["j5.gif",-50],
        ["jazz.gif",-50],
        ["melon.gif",-50],
        ["mexinyan.gif",-60],
        ["mummy.gif",-50],
        ["newyear.gif",-50],
        ["nyaninja.gif",-40],
        ["patty.gif",-110],
        ["pikanyan.gif",-50],
        ["pumpkin.gif",-50],
        ["sad.gif",-50],
        ["smurf.gif",-50],
        ["vday.gif",-50],
        ["xmas.gif",-50]
];
var count_down_interval;
var count_down_val = 5;
var tutorial_img_interval;
var my_cat_flow;
var my_cat;
var bg_img, bg_sun, bg_grass_1, bg_grass_2, bg_grass_3;
var grass_1_x = grass_2_x = grass_3_x = 0;
var grass_1_speed = 0.7; 
var grass_2_speed = 0.3;
var grass_3_speed = 0.4;
var grass_width = 2000;
var stop_canvas = false;
var sun_rotation = 0;

function init_vis_canvas() {
    $(".select_sound").click(function(){
      $(".select_sound").removeClass("sel_highlighted");
      local_sound_choice = this.id.split("_")[1] - 1;
      $("#sound_"+(local_sound_choice+1)).addClass("sel_highlighted");
    });
    // init all background images
    bg_img = new Image();
    bg_img.src = "images/bg.jpg";
    bg_sun = new Image();
    bg_sun.src = "images/sun.png";
    bg_grass_1 = new Image();
    bg_grass_1.src = "images/grass_1.png";
    bg_grass_2 = new Image();
    bg_grass_2.src = "images/grass_2.png";
    bg_grass_3 = new Image();
    bg_grass_3.src = "images/grass_3.png";
    // init the cloud
    for(var i = 0 ; i< 12 ; i++){
        var img = new Image();;
        img.src = "images/cloud_1.png";
        clouds.push(new Cloud(
            Math.random()*$(window).width()*2,
            getRandomInt(90,300),
            getRandomInt(80,150),
            getRandomInt(50,90),
            img,
            getRandomFloat(0.6,1),
            getRandomFloat(0.3,0.8)
        ));
    }

    canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        $(canvas).attr("width",$(window).width());
        $(canvas).attr("height",$(window).height() - $(canvas).position().top);
        ctx = canvas.getContext("2d");
        setInterval(draw, refresh_interval);
    }
    show_cat_select();
}

function draw() {
    if(stop_canvas) return;
    var w = $(canvas).width();
    var h = $(canvas).height();
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(bg_img, 0, 0,w,h);

    // draw the sun and the grass land
    sun_rotation -= 0.0005;
    ctx.rotate(sun_rotation);
    ctx.drawImage(bg_sun, -400, -400,800,800);
    ctx.rotate(-sun_rotation);
    grass_1_x -= grass_1_speed;
    grass_2_x -= grass_2_speed;
    grass_3_x -= grass_3_speed;
    if(grass_1_x <= - grass_width){
        grass_1_x = 0;
    }
    if(grass_2_x <= - grass_width){
        grass_2_x = 0;
    }
    if(grass_3_x <= - grass_width){
        grass_3_x = 0;
    }
    ctx.drawImage(bg_grass_3, grass_1_x, h-60,grass_width,60);
    ctx.drawImage(bg_grass_3, grass_1_x+grass_width, h-60,grass_width,60);
    ctx.drawImage(bg_grass_2, grass_2_x, h-60,grass_width,60);
    ctx.drawImage(bg_grass_2, grass_2_x+grass_width, h-60,grass_width,60);
    ctx.drawImage(bg_grass_1, grass_3_x, h-40,grass_width,60);
    ctx.drawImage(bg_grass_1, grass_3_x+grass_width, h-40,grass_width,60);

    // generate note
    if(cat_selection) return;
    var rand = Math.random();
    if(rand > 0.7){
        if(mouse_down||leap_trigger){ // perf improvement
            add_note(mouse_doc_x - $(canvas).position().left,
                mouse_doc_y - $(canvas).position().top,
                note_r * (Math.random() + 0.5),
                mouse_down||leap_trigger,
                local_sound_choice,
                make_note(),
                Math.random()*local_gain_value);
        }
    }

    for (var id in other_player_info) {
        if(other_player_info[id].mousedown){ // perf inprovement
            var rand = Math.random();
            if(rand > 0.7){
                add_note(other_player_info[id].x,
                    other_player_info[id].y,
                    note_r * (Math.random() + 0.5),
                    other_player_info[id].mousedown,
                    other_player_info[id].c,
                    make_note(),
                    Math.random()*other_player_info[id].g);
            }
        }
    }

    for (i = 0; i < clouds.length; i++) {
        draw_and_update_clouds(clouds[i]);
    }

    for (i = 0; i < notes.length; i++) {
        draw_and_update_notes(notes[i]);
    }

}

function Note(x, y, r, filled, color_id,text,alpha) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.t = text;
    this.a = alpha;
    this.color = colors[color_id];
    this.stroke = color_strokes[color_id];
    this.filled = filled;
    this.y_speed = Math.random()/2;
    if(Math.random() > 0.5){
        this.up = true;
    }else{
        this.up = false;
    }   
}

function Cloud(x,y,w,h,image,alpha,speed){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.image = image;
    this.a = alpha;
    this.speed = speed;
}

function add_note(x, y, r, fill, color_id,text,alpha) {
    var note = new Note(x, y, r, fill, color_id,text,alpha);
    notes.push(note);
}

function remove_note(note) {
    var index = notes.indexOf(note);
    if (index >= 0) {
        notes.splice(index, 1);
    }
    else {
        console.log("failed to find note");
        console.log(note);
    }
}

function draw_and_update_notes(note) {
    if (note.x < -40) {
        remove_note(note);
    }
    if(note.filled){
        ctx.globalAlpha = note.a;
        ctx.fillStyle = note.color;
        ctx.strokeStyle = note.stroke;
    }else{
        ctx.globalAlpha = note.a * 0.5;
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#fff";
    }
    ctx.font = 'italic bold '+ note.r+'px Notes';
    ctx.textBaseline = 'middle';
    ctx.fillText(note.t, note.x, note.y);
    //ctx.strokeText(note.t, note.x, note.y);
    ctx.globalAlpha = 1.0;
    note.x -= note_speed_x;
    if(note.up){
        note.y += note.y_speed;
    }else{
        note.y -= note.y_speed;
    }
}

function draw_and_update_clouds(cloud){
     ctx.globalAlpha = cloud.a;
     ctx.drawImage(cloud.image, cloud.x, cloud.y,cloud.w,cloud.h);
     cloud.x -= cloud.speed;
        if (cloud.x < -200) {
            cloud.x = $(window).width() + 200 * Math.random();
        }  
    ctx.globalAlpha = 1;   
}

function make_note(){
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz";
    for( var i=0; i < 1; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function show_tutorial(){
  $("#tutorial").show();
  var duration = 5000;
  var time = duration;
  $("#t1").fadeIn();
  $("#progressbar").animate({"width":"350"},duration);
  setTimeout(function(){
    $("#progressbar").animate({"width":"0"},0);
    $("#t1").hide();
    $("#t2").fadeIn();
    $("#progressbar").animate({"width":"350"},duration);
  },time)
  time += duration;
  setTimeout(function(){
    $("#progressbar").animate({"width":"0"},0);
    $("#t2").hide();
    $("#t3").fadeIn();
    $("#progressbar").animate({"width":"350"},duration);
  },time)
  time += duration;
  setTimeout(function(){
    $("#progressbar").fadeOut();
    $("#t3").fadeOut();
    $("#tutorial").fadeOut();
    ready_to_start();
  },time)
}

function ready_to_start(){
    cat_selection = false;
    my_cat=get_active_cat();
    $("#note").fadeOut();
    $("#control").fadeIn();
    $(".cat_img img").attr("src","images/cats/"+cats[my_cat][0]);
    $(".cat_img img").css("margin-top",cats[my_cat][1]+"px");
    $("#cat_select").hide();
    $("#loading").fadeOut();
    $("#my_circle").show();
    // tutorial_img_interval = setInterval(function(){
    //     $(".tutorial_img").hide().fadeIn(600);
    // },600);
    // setTimeout(function(){
    //     $(".tutorial_img").fadeOut();
    //     clearInterval(tutorial_img_interval);
    // },3600);
    start_log();
}

function show_cat_select(){
    my_cat_flow = new ContentFlow('cat_select', {});
    for (cat in cats) {
        $('.ContentFlow .flow').append('<img class="item" href="javascript:ready_to_start()" src="/images/cats/' + cats[cat][0] + '"/>');
    }
    $("#loading").html("Please choose a cat to start");
}

function get_active_cat(){
    var img_path = $('#cat_select .active canvas').attr('src');
    var segments = img_path.split('/');
    var img_name = segments[segments.length - 1];
    for (i = 0; i < cats.length; i++) {
        if (img_name == cats[i][0])
            return i;
    }
    return -1;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

