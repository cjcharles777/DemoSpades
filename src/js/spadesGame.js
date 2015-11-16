function SpadesGame(players)
{

    console.trace();
    this.gameDeck = new Deck();
    this.playersHands = [];
    this.playersTurn = 0;
    this.players = players;

}


SpadesGame.prototype.dealOne = function()
{
    var c = this.gameDeck.drawCard();
    return c;
}

SpadesGame.prototype.dealOut = function()
{
    var i = 0;
    this.gameDeck.shuffle();
    this.gameDeck.shuffle();
    while (this.gameDeck._deck.length > 0)
    {
        if(this.playersHands[this.players[i]] == undefined)
        {
            this.playersHands[this.players[i]] = [];
        }
        this.playersHands[this.players[i]][this.playersHands[this.players[i]].length] = this.dealOne();
        if (i == 3)
        {
            i = 0;
        }
        else
        {
            i++;
        }

    }
}
SpadesGame.prototype.getHand = function(number)
{
    return this.playersHands[this.players[number]];
}

function compareRank(a, b)
{
    var intRegex = /^\d+$/;

    if (a.rank == b.rank)                       return 0;
    if (a.rank == "N")                          return 1;
    if (b.rank == "N")                          return -1;
    if (a.rank == "A")                          return 1;
    if (b.rank == "A")                          return -1;
    if (!isNaN(a.rank - b.rank))                return a.rank - b.rank;
    if (a.rank == "K" && b.rank == "J")         return 1;
    if (a.rank == "J" && b.rank == "K")         return -1;
    if (a.rank == "K" && b.rank == "Q")         return 1;
    if (a.rank == "Q" && b.rank == "K")         return -1;
    if (a.rank == "Q" && b.rank == "J")         return 1;
    if (a.rank == "J" && b.rank == "Q")         return -1;
    if (a.rank == "K" && intRegex.test(b.rank)) return 1;
    if (a.rank == "Q" && intRegex.test(b.rank)) return 1;
    if (a.rank == "J" && intRegex.test(b.rank)) return 1;
    if (intRegex.test(a.rank) && b.rank == "K") return -1;
    if (intRegex.test(a.rank) && b.rank == "Q") return -1;
    if (intRegex.test(a.rank) && b.rank == "J") return -1;
}

function Deck(conf) {
    var o = objExtend(Deck.defaults, conf);
    console.trace();
    console.log('instance created');
    this._deck = [];
    var l,i,s,r,j;
    // populate draw pile
    for (i = 0; i < 1; i++) {
        // standard
        console.log('suits' + o.suits);
        for (s in o.suits) {
            for (r in o.ranks) {
                l = this._deck.length;
                console.log('l = '+l);
                console.log('r = '+r);
                console.log('s = '+s);
                var tmpCard = new Card(r, o.ranks[r], s, o.suits[s]);
                if(!this.isExcluded(tmpCard))
                {
                    this._deck[l] = tmpCard;
                    console.log(this._deck[l].toString());
                }


            }
        }
        // jokers
        for (j = 0; j < o.jokers; j++) {
            l = this._deck.length;
            // suit will always be 1 or 2
            this._deck[l] = new Card("N", o.jokerText, (j % 2) + 1, '');
        }
    }




}


Deck.prototype.shuffle =
    function()
    {
        console.log("Cards before shuffle:" + this._deck);
        for (i = this._deck.length - 1; i > 0; i--) {
            toSwap = Math.floor(Math.random() * i);
            tempCard = this._deck[i];
            this._deck[i] = this._deck[toSwap];
            this._deck[toSwap] = tempCard;
        }
        console.log("Cards after shuffle: "+this._deck);
    };
Deck.prototype.drawCard =
    function()
    {
        return this._deck.pop();
    };

Deck.prototype.add =
    function(card)
    {
        this._deck.push(card);
    };

Deck.prototype.isExcluded =
    function(card)
    {
        return ((card.rank == '2' && card.suit == 'H')||(card.rank == '2' && card.suit == 'C'));
    }

Deck.defaults =
{
    "ofString" : " of ",
    "jokers": 2,
    "jokerText": "Joker",
    "ranks": {
        "2": "Two",
        "3": "Three",
        "4": "Four",
        "5": "Five",
        "6": "Six",
        "7": "Seven",
        "8": "Eight",
        "9": "Nine",
        "10": "Ten",
        "J": "Jack",
        "Q": "Queen",
        "K": "King",
        "A": "Ace"
    },
    "suits": {
        "S": "Spades",
        "D": "Diamonds",
        "C": "Clubs",
        "H": "Hearts"
    }
};

//Card
function Card(rank, rankString, suit, suitString)
{
    console.trace();

    this.rank = rank;
    this.rankString = rankString;
    this.suit = suit;
    this.suitString = suitString;
    this.cardId = suit + '_' + rank;
    return this;
}

Card.prototype.toString = function()
{
    return this.suitString !== "" ? this.rankString + Deck.defaults.ofString + this.suitString: this.rankString;
}

function objExtend(o, ex) {
    if (!ex) {
        return o;
    }
    for (var p in ex) {
        o[p] = ex[p];
    }
    return o;
}
