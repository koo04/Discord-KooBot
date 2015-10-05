var Card = require('./Card.js');
var CardCollection = require('./CardCollection.js');

/**
 * Deck constructor
 *
 * When creating a new deck, we iterate over every known face and suite combination,
 * adding each one to the collection of cards.
 */
var Deck = function() {
	var self = this;

	Card.prototype.suites.forEach(function(suite) {
		Card.prototype.faces.forEach(function(face) {
			self.cards.push(new Card(face, suite));
		});
	});
};

/**
 * The Deck class extends the CardCollection class
 */
Deck.prototype = new CardCollection();
Deck.prototype.constructor = Deck;

/**
 * Drawing a card simply pops a card from the end of the deck
 */
Deck.prototype.draw = function() {
	return this.cards.pop();
};

/**
 * Shuffling a deck uses this goofy looking function I found from the Internets.
 */
Deck.prototype.shuffle = function() {
	for (var j, x, i = this.cards.length; i; j = Math.floor(Math.random() * i), x = this.cards[--i], this.cards[i] = this.cards[j], this.cards[j] = x);

	return this;
};

module.exports = Deck;