var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var playerCards, eastOppCards, northOppCards, westOppCards,
    cardsInPlay;

function preload()
{
    game.load.image('spades_a', 'img/cards/Spades/A.png');
    game.load.image('back_pomegranate', 'img/cards/Backs/Pomegranate.png');
}

function create() {
    game.stage.backgroundColor = '#355e3b';
    playerCards = game.add.group();
    eastOppCards = game.add.group();
    northOppCards = game.add.group();
    westOppCards = game.add.group();
    cardsInPlay = game.add.group();
    var item;

    for (var i = 0; i < 13; i++)
    {
        item = playerCards.create(i*50, 0, 'spades_a');
        item.inputEnabled = true;
        item.events.onInputOver.add(lift);
        item.events.onInputOut.add(drop);
        item.events.onInputDown.add(confirmDoubleClick);
    }

    for (var i = 0; i < 13; i++)
    {
        item = eastOppCards.create(i*50, 0, 'back_pomegranate');

    }
    for (var i = 0; i < 13; i++)
    {
        item = northOppCards.create(i*50, 0, 'back_pomegranate');

    }
    for (var i = 0; i < 13; i++)
    {
        item = westOppCards.create(i*50, 0, 'back_pomegranate');

    }

    playerCards.scale.set(0.25,0.25);
    playerCards.x = game.world.width/2 - (((30 * playerCards.length) + 130) *.25);
    playerCards.y = game.world.height-125;

    eastOppCards.scale.set(0.25,0.25);
    eastOppCards.x = game.world.width - 125;
    eastOppCards.y = game.world.height/2 + (((30 * eastOppCards.length) + 130) *.25);
    eastOppCards.angle = -90;

    northOppCards.scale.set(0.25,0.25);
    northOppCards.x = game.world.width /2 + (((30 * northOppCards.length) + 130) * .25);
    northOppCards.y = 125;
    northOppCards.angle = 180;

    westOppCards.scale.set(0.25,0.25);
    westOppCards.x = 125;
    westOppCards.y = game.world.height/2 - (((30 * westOppCards.length) + 130) *.25);
    westOppCards.angle = 90;


    cardsInPlay.scale.set(0.25,0.25);
    cardsInPlay.x = 400 - ((190 + 90)*.25);
    cardsInPlay.y = 300 - (127.5*.25);
}

function update()
{

}

function lift(item)
{
        if (item.y == 0 )
        {
            game.add.tween(item).to( { y: -380 }, 250, Phaser.Easing.Linear.None, true);
        }






}
function drop(item)
{
    var tween = getTween(item);
    if (item.y === -380 )
    {
        tween.to({y: 0}, 250, Phaser.Easing.Linear.None, true);
    }
    else if(item.y > -380 && item.y <= 0)
    {
        tween.onComplete.addOnce(function(){tween.to({y: 0}, 250, Phaser.Easing.Linear.None, true);});
    }



}

function getTween(item)
{
    var gameTweens = game.tweens.getAll();
    for(var x in gameTweens)
    {
        if(gameTweens[x].target == item)
        {
            return gameTweens[x];
        }
    }

    return game.add.tween(item);
}


function confirmDoubleClick (itemBeingClicked)
{
    if (!this.secondClick)
    {
        this.secondClick = true;
        this.time.events.add(300, function(){
            this.secondClick = false;
        },this);
        return;
    }

    putCardInPlay(itemBeingClicked)
}

function putCardInPlay(item)
{
    cardsInPlay.add(item);
    item.inputEnabled = false;
}

var socket = io.connect('http://localhost:3700');
socket.on('connect', function(data) {
    socket.emit('ping', '');
});
