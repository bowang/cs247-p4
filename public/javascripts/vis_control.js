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
        ctx.translate(0.5, 0.5);
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
    if (circle.filled) {
        ctx.fillStyle = "gray";
        ctx.fill();
    }
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
    add_circle(mouse_doc_x - $(canvas).position().left,
        mouse_doc_y - $(canvas).position().top,
        circle_r * (Math.random() + 0.5),
        mouse_down||leap_trigger);
    for (var id in other_player_info) {
        add_circle(other_player_info[id].x,
            other_player_info[id].y,
            circle_r * (Math.random() + 0.5),
            other_player_info[id].mousedown);
    }

    for (i = 0; i < circles.length; i++) {
        draw_circle(circles[i]);
        update_circle(circles[i]);
    }
}
