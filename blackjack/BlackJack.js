var exports = module.exports = {};
var Deck = require('./Deck.js');
var Hand = require('./Hand.js');

var deck, player, house;

// Player bet
var bet;

exports.game = function(callback) {

  // Create a new deck and shuffle it
  deck = new Deck().shuffle();

  // Create a new hand for the player
  player = new Hand();

  // Create a new hand for the House
  house = new Hand();
  
  // The player draws two cards from the deck
  player.add(deck.draw());
  player.add(deck.draw());

  // House gets a card
  house.add(deck.draw());
  console.log(house.toString());
  // Report the Hands delt
//  var s = "\nYour Hand:\n" + player.toString() + "\nHouse Hand:\n" + house.toString();
//  
//  // House gets a card hidden to the player
//  house.add(deck.draw());
//  
//  return callback(s);
}

// Deal or House plays. 0 = playing, 1 = player win, 2 = house win
exports.play = function(hit, callback) {
  if (hit) {
    player.add(deck.draw());
    var s = "";
    if (player.bust()) {
      s = "BUST\n" + player.toString();
      return callback(2, player.toString());
    } else {
      s = "HITTING\n" + player.toString();
      return callback(0, s);
    }
  } else {
    s = "STAYING\n" + player.toString();
    house.add(deck.draw());

    if(!house.bust()) {
      s.concat("\nHouse Drew\n" + house.toString());
    }

    while(!house.bust() && house.score() < player.score() && house.score() < 21) {
      house.add(deck.draw());
      s.concat("\nHouse Drew Another\n" + house.toString());
    }
    
    if(house.bust()) {
      s.concat("\nYou win!\n" + player.toString() + "\n" + house.toString());
      return callback(1, s);
    }
    
    if(!house.bust() && house.score() > player.score()) {
      s.concat("\nYou lost!\n" + player.toString() + "\n" + house.toString());
      return callback(2, s);
    }
  }
}