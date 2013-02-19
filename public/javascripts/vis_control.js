var ctx;
var canvas;
var weaver;
var refresh_interval = 20;
var line_num = 16 - 1;
var ribbon_speed_x = 10;
var ribbons = new Array();

// Variables for ribbon.js
var SCREEN_WIDTH;
var SCREEN_HEIGHT;
var BRUSH_SIZE;
var BRUSH_PRESSURE;
var COLOR;

function Ribbon(x0, y0, x1, y1) {
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
    this.color = "rgb(0,0,0)";
}

function add_ribbon(x0, y0, x1, y1) {
    ribbons.push(new Ribbon(x0, y0, x1, y1));
}

function remove_ribbon(ribbon) {
    var index = ribbons.indexOf(ribbon);
    if (index >= 0) {
        ribbons.splice(index, 1);
    }
    else {
        console.log("failed to find circle");
        console.log(circle);
    }
}

function init_ribbon(ctx) {
    SCREEN_WIDTH = $(canvas).attr("width");
    SCREEN_HEIGHT = $(canvas).attr("height");
    BRUSH_SIZE = 1;
    BRUSH_PRESSURE = 1;
    COLOR = [0, 0, 0];
    weaver = new ribbon(ctx);
}

function init_vis_canvas() {
    canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        $(canvas).attr("width",$(window).width() * 0.98);
        $(canvas).attr("height",$(window).height() * 0.98 - $(canvas).position().top);
        ctx = canvas.getContext("2d");
        ctx.translate(0.5, 0.5);
        init_ribbon(ctx);
        setInterval(draw, refresh_interval);
    }
}

function draw_line(x0, y0, x1, y1) {
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
}

function draw_ribbon(ribbon) {
    weaver.strokeStart(ribbon.x0, ribbon.y0);
    weaver.stroke(ribbon.x1, ribbon.y1);
    weaver.strokeEnd();
    weaver.update();
}

function update_ribbon(ribbon) {
    ribbon.x0 -= ribbon_speed_x;
    ribbon.x1 -= ribbon_speed_x;
    if (ribbon.x0 < 0 && ribbon.x1 < 0) {
        remove_ribbon(ribbon);
    }
}

var prev_x = -1;
var prev_y = -1;

function draw() {
    var w = $(canvas).width();
    var h = $(canvas).height();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, w, h);
    var gap = $(canvas).height() / (line_num + 1);
    for (i = 0; i < line_num; i++) {
        var y = (i+1) * gap;
        draw_line(0, y, w, y);
    }

    var new_x = mouse_doc_x - $(canvas).position().left;
    var new_y = mouse_doc_y - $(canvas).position().top;
    if ((!isNaN(new_x) && !isNaN(new_y)) && (prev_x < 0 || prev_y < 0))
    {
        prev_x = new_x;
        prev_y = new_y;
        return;
    }

    if ((!isNaN(new_x) && !isNaN(new_y)) && (prev_x != new_x || prev_y != new_y))
    {
        // add_ribbon(prev_x, prev_y, new_x, new_y);
        prev_x = new_x;
        prev_y = new_y;
    }

    /*
    for (var id in other_player_info) {
        add_circle(other_player_info[id].x,
            other_player_info[id].y,
            circle_r * (Math.random() + 0.5),
            other_player_info[id].mousedown);
    }
    */

    /*
    console.log(ribbons.length);
    for (i = 0; i < ribbons.length; i++) {
        draw_ribbon(ribbons[i]);
        // update_ribbon(ribbons[i]);
    }
    */
}
