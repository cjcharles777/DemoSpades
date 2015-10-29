function Spades()
{
    var self = this;

    var socket = io.connect('http://serene-ridge-3706.herokuapp.com/');

    socket.on('disconnect', function (data) {
        var msg = 'Connection loss :\\';
        console.error(msg + "\n" + data);
        window.alert(msg + "\n" + data);
        location.href = location.href.replace(location.hash, "");
    });
    socket.on('error', function (data) {
        console.error(data);
        window.alert(data);
        location.href = location.href.replace(location.hash, "");
    });
    socket.on('errorMsg', function (data) {
        console.error("[Error:" + data.num + "] " + data.msg);
        window.alert("Error " + data.num + "\n" + data.msg);
        location.href = location.href.replace(location.hash, "");
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
    var gameDiv = "game";
    var gameWidth = parseInt(document.getElementById(gameDiv).offsetWidth);
    var gameHeight = parseInt(document.getElementById(gameDiv).offsetHeight);

    var debug = false;
    var host = false;
    var game = new Phaser.Game(gameWidth, gameHeight, debug ? Phaser.CANVAS : Phaser.AUTO, gameDiv, null, null, false, false);
    var playerCards, eastOppCards, northOppCards, westOppCards,
        cardsInPlay;
    var currentPlayer = -1;
    var master = false;
    var paddles = [];


    var colors = ["ff0000", "00ff00", "0000ff", "ffff00"];

    var BootState = {
        preload: function () {
            game.load.image('loadingBar', 'img/textures/loading.png');
        },
        create: function () {
            game.state.start('preload');
        }
    };

    var LoadingState = {
        preload: function () {
            game.stage.disableVisibilityChange = true;

            this.loadingBar = game.add.sprite(0, 0, 'loadingBar');
            // Center the preload bar
            this.loadingBar.x = game.world.centerX - this.loadingBar.width / 2;
            this.loadingBar.y = game.world.centerY - this.loadingBar.height / 2;
            game.load.setPreloadSprite(this.loadingBar);

            game.load.image('spades_a', 'img/cards/Spades/A.png');
            game.load.image('back_pomegranate', 'img/cards/Backs/Pomegranate.png');
        },
        create: function () {
            this.loadingBar.destroy();

            game.stage.backgroundColor = '#355e3b';
            playerCards = game.add.group();
            eastOppCards = game.add.group();
            northOppCards = game.add.group();
            westOppCards = game.add.group();
            cardsInPlay = game.add.group();
            var item;

            for (var i = 0; i < 13; i++) {
                item = playerCards.create(i * 50, 0, 'spades_a');
                item.inputEnabled = true;
                item.events.onInputOver.add(lift);
                item.events.onInputOut.add(drop);
                item.events.onInputDown.add(confirmDoubleClick);
            }

            for (var i = 0; i < 13; i++) {
                item = eastOppCards.create(i * 50, 0, 'back_pomegranate');

            }
            for (var i = 0; i < 13; i++) {
                item = northOppCards.create(i * 50, 0, 'back_pomegranate');

            }
            for (var i = 0; i < 13; i++) {
                item = westOppCards.create(i * 50, 0, 'back_pomegranate');

            }

            playerCards.scale.set(0.25, 0.25);
            playerCards.x = game.world.width / 2 - (((30 * playerCards.length) + 130) * .25);
            playerCards.y = game.world.height - 125;

            eastOppCards.scale.set(0.25, 0.25);
            eastOppCards.x = game.world.width - 125;
            eastOppCards.y = game.world.height / 2 + (((30 * eastOppCards.length) + 130) * .25);
            eastOppCards.angle = -90;

            northOppCards.scale.set(0.25, 0.25);
            northOppCards.x = game.world.width / 2 + (((30 * northOppCards.length) + 130) * .25);
            northOppCards.y = 125;
            northOppCards.angle = 180;

            westOppCards.scale.set(0.25, 0.25);
            westOppCards.x = 125;
            westOppCards.y = game.world.height / 2 - (((30 * westOppCards.length) + 130) * .25);
            westOppCards.angle = 90;


            cardsInPlay.scale.set(0.25, 0.25);
            cardsInPlay.x = 400 - ((190 + 90) * .25);
            cardsInPlay.y = 300 - (127.5 * .25);
        },
        update: function () {

        }
    };

    var SynchState = {
        p: false,
        players: 0,
        countdown: false,
        init: function (data) {
            game.stage.disableVisibilityChange = true;

            var self = this;

            self.players = parseInt(data.playersCount);
            if (data.hosting) {
                self.p = 0;
                host = true;
                socket.emit('startCounting', socket.id);
            }
            else {
                self.p = data.playersCount - 1;
                socket.on('joined', function (data) {
                    self.players = parseInt(data.playersCount);
                });
                socket.on('playerLeft', function (data) {
                    self.players = parseInt(data.playersCount);
                });
            }
            socket.on('timeOut', function (data, ack) {
                self.countdown = parseInt(data.times);
                ack(socket.id);
            });
        },
        preload: function () {
            //TODO: Put things here
        },
        create: function () {
            var style = {font: "30px Arial", fill: "#ffffff", align: "center"};
            this.text = game.add.text(game.world.centerX, game.world.centerY, "Awaiting other players (" + this.players + "/4)", style);
            this.text.anchor.setTo(0.5, 0.5);
        },
        update: function () {


            if (this.countdown === false) {
                //TODO: Add a demoMovements();
            }
            else {
                this.initGame(this.countdown);
            }

            if (this.countdown !== false) {
                this.text.text = "Ready to start...";
            }
            else if (host || this.players == 4) {
                this.text.text = "Waiting for sync...";
            }
            else {
                this.text.text = "Awaiting other players (" + this.players + "/4)";
            }
        },
        initGame: function (phase) {
            switch (phase) {
                case 1:
                //TODO: What does this do?
                case 2:
                    //TODO: What does this do?
                    this.text.text = "GO!";
                case 3:
                    socket.removeAllListeners('joined');
                    socket.removeAllListeners('timeOut');
                    socket.removeAllListeners('playerLeft');
                    this.text.destroy();
                    game.state.start("game", false, false, {player: this.p});
                    break;
            }
        }
    };

    var GameState = {
        inactivePlayers: {0: false, 1: false, 2: false, 3: false},
        gameRunning: false,
        spadePhase: 1,
        init: function (data) {
            game.stage.disableVisibilityChange = true;

            var self = this;
            currentPlayer = data.player;
            master = data.player == 0;

            socket.on('playerLeft', function (data) {
                self.inactivePlayers[parseInt(data.playerLeft)] = true;
            });
            socket.on('clientUpdate', function (data) {
                self.updateClient(data);
            });
            socket.on('clientUpdateScores', function (data) {
                self.updateClientScores(data);
            });
             socket.on('clientUpdateHand', function (data) {
                  self.updateClientHand(data);
              });
            socket.on('becomeHost', function (data) {
                master = true;
                //TODO: What does the host know?
            });
            socket.on('dealtOne', function (data) {
                $('#infoTextCenter').append(data);
            });
        },
        create: function () {

            this.gameRunning = true;
        },
        update: function () {
            if (this.gameRunning) {


                switch(this.spadePhase)
                {
                    case 1: this.shuffle();
                            break;
                    case 2: this.bid();
                            break;
                    case 3: this.playHand();
                            break;
                    case 4: this.calculatePoints();
                            break;
                }
                this.updateServer();

            }
        },
        shuffle: function () {
            //TODO:Shuffle and deal here
            socket.emit('shuffleAndDeal', socket.id);
        },
        bid:function()
        {
            //TODO: Take Bids here;
        },
        playHand: function()
        {
          //TODO: Play Hand Here
        },
        calculatePoints:function()
        {
            //TODO: Calculate the points after hand has been played
        },
        inputManagement: function () {
            //TODO: How do we handle the inputs here.
        },
        endGame: function (player) {
            this.gameRunning = false;

            //TODO:Destroy all


            var style = {font: "50px Arial", fill: "#ffffff", align: "center"};
            var wonSentence = player.player == currentPlayer ? "You win!" : player.name + " wins!";
            var text = game.add.text(game.world.centerX, game.world.centerY, wonSentence, style);
            text.anchor.setTo(0.5, 0.5);

            socket.removeAllListeners('playerLeft');
            socket.removeAllListeners('clientUpdate');
            socket.removeAllListeners('clientUpdateScores');
            //socket.removeAllListeners('clientUpdateBall');
            socket.removeAllListeners('becomeHost');
            socket.removeAllListeners('disconnect');
            socket.removeAllListeners('errorMsg');
            socket.removeAllListeners('error');

            $("#connect tr").addClass("hide");
            $("#endContainer").removeClass("hide");
            $("#connect").removeClass("hide").css("background-color", "transparent");

            setTimeout(function () {
                socket.disconnect();
            }, 5000);
        },
        socketTiming: 0,
        socketDelay: 16,
        getSocketDelay: function () {
            return ping < this.socketDelay ? ping : this.socketDelay;
        },
        updateServer: function () {
            this.socketTiming += game.time.elapsed;
            if (this.socketTiming < this.getSocketDelay()) {
                return;
            }
            this.socketTiming = 0;
            var data = {socketId: socket.id};

            if (master) {
                //TODO: update data for world
            }
            else {
                //TODO: Update data for self
            }

            data['player'] = parseInt(currentPlayer);
            switch (data['player']) {
                case 0:
                case 2:
                case 1:
                case 3:
                    //TODO: update player data
                    break;
            }

            socket.emit('gameUpdate', data);
        },
        updateClient: function (data) {
            //TODO: Update Clients
        },
        updateClientScores: function (data) {
            if (!master) {

            }
        },
        updateClientHand: function (data) {
           //TODO: Get the hand from the server
        },
        render: function () {
            //       if (debug) {
            //          game.debug.body(ball);
            //          for (var i in paddles) {
            //               game.debug.body(paddles[i]);
            //           }
            //       }
        }
    };

    game.state.add("boot", BootState, true);
    game.state.add("preload", LoadingState, false);
    game.state.add("sync", SynchState, false);
    game.state.add("game", GameState, false);

    this.switchToSync = function (data) {
        game.state.start("sync", false, false, data);
    };

    this.getSocket = function () {
        return socket;
    };


    function lift(item) {
        if (item.y == 0) {
            game.add.tween(item).to({y: -380}, 250, Phaser.Easing.Linear.None, true);
        }


    }

    function drop(item) {
        var tween = getTween(item);
        if (item.y === -380) {
            tween.to({y: 0}, 250, Phaser.Easing.Linear.None, true);
        }
        else if (item.y > -380 && item.y <= 0) {
            tween.onComplete.addOnce(function () {
                tween.to({y: 0}, 250, Phaser.Easing.Linear.None, true);
            });
        }


    }

    function getTween(item) {
        var gameTweens = game.tweens.getAll();
        for (var x in gameTweens) {
            if (gameTweens[x].target == item) {
                return gameTweens[x];
            }
        }

        return game.add.tween(item);
    }


    function confirmDoubleClick(itemBeingClicked) {
        if (!this.secondClick) {
            this.secondClick = true;
            this.time.events.add(300, function () {
                this.secondClick = false;
            }, this);
            return;
        }

        putCardInPlay(itemBeingClicked)
    }

    function putCardInPlay(item) {
        cardsInPlay.add(item);
        item.inputEnabled = false;
    }


    return this;
}

Spades.prototype.getSocket = function () {
    return this.getSocket();
};
Spades.prototype.sync = function(data) {
    this.switchToSync(data);
};
