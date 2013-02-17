var ctx;
var canvas;
var refresh_interval = 20;
var line_num = 16 - 1;
var circle_speed_x = 10;
var circle_r = 5;

function init_vis_canvas() {
    canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        $(canvas).attr("width",$(window).width() * 0.98);
        $(canvas).attr("height",$(window).height() * 0.98 - $(canvas).position().top);
        ctx = canvas.getContext("2d");
        //ctx.translate(0.5, 0.5);
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

function draw_circle(circle) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = circle.color;
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI*2, true);
    ctx.stroke();
}

function update_circle(circle) {
    circle.x -= circle_speed_x;
    if (circle.x < 0) {
        remove_circle(circle);
    }
}

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
    for (i = 0; i < circles.length; i++) {
        draw_circle(circles[i]);
        update_circle(circles[i]);
    }
}
