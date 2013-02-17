var circles = new Array();

function Circle(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = "rgb(0,0,0)";
}

function add_circle(x, y, r) {
    var circle = new Circle(x, y, r);
    circles.push(circle);
    console.log("added circle (" + x + ", " + y + ", " + r + ")");
}

function remove_circle(circle) {
    var index = circles.indexOf(circle);
    if (index >= 0) {
        circles.splice(index, 1);
        console.log("removed circle");
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

