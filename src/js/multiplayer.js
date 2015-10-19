/**
 * Created by cedric on 10/19/15.
 */

var self = this;

var socket = io.connect('http://localhost:3700');

socket.on('disconnect', function(data) {
    var msg = 'Connection loss :\\';
    console.error(msg+"\n"+data);
    window.alert(msg+"\n"+data);
    location.href = location.href.replace(location.hash,"");
});
socket.on('error', function(data) {
    console.error(data);
    window.alert(data);
    location.href = location.href.replace(location.hash,"");
});
socket.on('errorMsg', function(data) {
    console.error("[Error:"+data.num+"] "+data.msg);
    window.alert("Error "+data.num+"\n"+data.msg);
    location.href = location.href.replace(location.hash,"");
});


var pingTime;
var ping;
socket.on('pong', function () {
    latency = Date.now() - pingTime;
    ping = latency;
});

function measurePing() {
    setTimeout(function () {
        pingTime = Date.now();
        socket.emit('ping');
        measurePing();
    }, 2000);
}
measurePing();

