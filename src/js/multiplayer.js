/**
 * Created by cedric on 10/19/15.
 */
$(function() {
    var hash = false;
    if (window.location.hash.length > 0) {
        hash = window.location.hash.substr(1);
    }

    var spades = new Spades();
    var socket = spades.getSocket();

    $("#buttonsContainer").removeClass("hide");

    $("#hostGame").click(function () {
        $("#buttonsContainer").addClass("hide");
        $("#qrcodeContainer").removeClass("hide");

        var $playersCount= $("#playersCount");

        socket.on('joined', function(data) {
            data.playersCount = parseInt(data.playersCount);

            if ($playersCount.length > 0) {
                $playersCount.text(data.playersCount);
            }
            if (data.playersCount == 4) {
                $("#connect").addClass("hide");
                spades.sync({ hosting: true, playersCount: data.playersCount });
            }
        });
        socket.on('playerLeft', function (data) {
            data.playersCount = parseInt(data.playersCount);

            if ($playersCount.length > 0) {
                $playersCount.text(data.playersCount);
            }
            if (data.playersCount == 4) {
                $("#connect").addClass("hide");
                spades.sync({ hosting: true, playersCount: data.playersCount });
            }
        });
        socket.emit('host', '', function(data) {
            $('#qrcode').qrcode({width: 245,height: 245,text: window.location.href+"#"+data });

            $("#gameId").text(data);
        });
    });

    $("#joinGame").click(function () {
        $("#buttonsContainer").addClass("hide");
        $("#formContainer").removeClass("hide");

        if (hash.length > 0) {
            $("#inputGameId").val(hash);
        }
        $("#inputGameId").select();
    });

    $("#joinGameId").click(function () {
        $("#connect").addClass("hide");

        socket.emit('join', $("#inputGameId").val().trim(), function(data) {
            spades.sync({ hosting: false, playersCount: parseInt(data.playersCount) });
        });
    });

    $("#restartGame").click(function () {
        socket.removeAllListeners('disconnect');
        socket.disconnect();
        location.href = location.href.replace(location.hash,"");
    });

    if (hash.length > 0) {
        $("#joinGame").trigger('click');
    }
});
