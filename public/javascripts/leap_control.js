
// Create the socket with event handlers
function init_leap() {
    var ws;

    // Support both the WebSocket and MozWebSocket objects
    if ((typeof(WebSocket) == 'undefined') &&
        (typeof(MozWebSocket) != 'undefined')) {
        WebSocket = MozWebSocket;
    }

    //Create and open the socket
    ws = new WebSocket("ws://localhost:6437/");

    // On successful connection
    ws.onopen = function(event) {
        $("#leap_status").html("WebSocket connection open!");
    };

    // On message received
    ws.onmessage = function(event) {
        var obj = JSON.parse(event.data);
        var str = JSON.stringify(obj, undefined, 2);
        $("#leap_status").html('<pre>' + str + '</pre>');
    };

    // On socket close
    ws.onclose = function(event) {
        ws = null;
        $("#leap_status").html("WebSocket connection closed!");
    }

    //On socket error
    ws.onerror = function(event) {
        alert("Received error");
    };

}
