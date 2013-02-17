var circles = new Array();

function Circle(x, y, r, filled) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = "rgb(0,0,0)";
    this.filled = filled;
}

function add_circle(x, y, r) {
    var circle = new Circle(x, y, r, mouse_down||leap_trigger);
    circles.push(circle);
}

function add_circles(x, y, n) {
    add_circle(x, y, circle_r * (Math.random() + 0.5));
    for (i = 1; i < n; i++) {
        setTimeout(function(){
            add_circle(x, y, circle_r * (Math.random() + 0.5));
        }, refresh_interval * i);
    }
}

function remove_circle(circle) {
    var index = circles.indexOf(circle);
    if (index >= 0) {
        circles.splice(index, 1);
    }
    else {
        console.log("failed to find circle");
        console.log(circle);
    }
}

$(document).ready(function(){
    create_audio_context();
    init_vis_canvas();
    init_leap();
});

