var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var cards;
var currentSelectedItem;
function preload()
{
    game.load.image('spades_a', 'img/cards/Spades/A.png');
}

function create() {
    game.stage.backgroundColor = '#355e3b';
    cards = game.add.group();
    var item;

    for (var i = 0; i < 13; i++)
    {
        item = cards.create(i*50, 0, 'spades_a');
        item.inputEnabled = true;
        item.events.onInputUp.add(lift);
    }
    cards.scale.set(0.25,0.25);
    cards.x = game.world.width/2 - (((30 * cards.length) + 130) *.25);
    cards.y = game.world.height-125;
}

function update()
{

}

function lift(item)
{
    if(currentSelectedItem != null)
    {
        currentSelectedItem.y = currentSelectedItem.y + 380;
    }
    if(currentSelectedItem != item)
    {
        item.y = item.y - 380;
        currentSelectedItem = item;
    }
    else
    {
        item.kill();
        currentSelectedItem = null;
    }

}
