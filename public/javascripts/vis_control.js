var ctx;

function init_vis_canvas() {
    var canvas = $('#canvas');
    if (canvas.getContext) {
        ctx = canvas.getContext("2d");
        setInterval(draw, 20);
    }
}

function draw() {

}
