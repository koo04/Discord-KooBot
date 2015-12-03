var Discord = require('discord.js'),
    Wordnet = require('wordnet'),
    Request = require('request'),
    Cheerio = require('cheerio'),
    fs = require("fs"),
    ships = require("./ships.json"),
    Deck = require('./blackjack/Deck.js'),
    Hand = require('./blackjack/Hand.js');
    BlackJack = require('./blackjack/BlackJack.js'),
    players = require('./players.json');

try {
  var settings = require('./settings.json');
} catch (err) {
  if(err) {
    var strJson = JSON.stringify({ email:"your@email.com", password:"Secure Password"});
    fs.writeFileSync("settings.json", strJson);
    var settings = require('./settings.json');
  }
}

var myBot = new Discord.Client({queue: true});
var server;
var idle = false;
var reminders = [];
var searching = false;
var bjGames = new Array();

/**
 * Converts a String to Time in Milliseconds
 */
function textToTime(time, kind, callback){
  if(kind == "seconds" || kind == "second")
    return callback(false, parseInt(time) * 1000);
  
  if(kind == "minutes" || kind == "minute")
    return callback(false, parseInt(time) * 60 * 1000);
  
  if(kind == "hours" || kind == "hour")
    return callback(false, parseInt(time) * 60 * 1000);
    
  return callback(true, null);
};

/**
 * Gets the request ship.
 * shipName - String
 * bot - Discord Client
 * message - Discord Message
 * callback - A function (Error, Ship)
 */
function getShip(shipName, bot, message, callback) {
  bot.sendMessage(message, "Searching the database...");
  for(var i = 0; i < ships['data'].length; i++) {
    var ship = ships['data'][i];
    if(ship.name.toUpperCase().indexOf(shipName.toUpperCase()) > -1) {
      console.log(ship.name + " is the ship!");
      return callback(false, ship);
    } else {
      console.log(ship.name + " is not the ship. Looking for " + shipName);
    }
    if(i == ships['data'].length) {
      return callback(true, null);
    }
  }
}

/**
 * Returns a random number from 1 to given max.
 */
function roll(max) {
  return Math.floor(Math.random() * (max - 1)) + 1;
}

/**
 * Do something on a message.
 */
myBot.on('message', function(message){
//  console.log(message);
  /**
   * Check if we are issueing a command.
   */
  if(message.content.charAt(0) === '!'){
    /**
     * Ping Pong. Used to test of the bot is working right.
     */
    if(message.content === "!ping")
      myBot.reply(message, "pong");

    /**
     * Ship. Get ship data from the ship json database.
     */
    if(message.content.indexOf('!ship') > -1) {
      var split = message.content.split(" ");
      var shipName;
      if(split.length > 1) {
        if(split[1]) {
          shipName = split[1];
          if(split[2])
            shipName = shipName + " " + split[2];

          getShip(shipName, myBot, message, function(err, ship){
            if(err) myBot.reply(message, "That ship does not seem to be in my database.");

            return myBot.reply(message, "Here is the ship information you requested: " + 
                        "\nName: " + ship.name + 
                        "\nHangar Ready: " + ship.production_status + 
                        "\nFocus: " + ship.focus +
                        "\nManufacturer: " + ship.manufacturer.name + 
                        "\nLength: " + ship.length + 
                        "\nHeight: " + ship.height + 
                        "\nBeam: " + ship.beam + 
                        "\nMass: " + ship.mass + 
                        "\nCargo Capacity: " + ship.cargocapacity + 
                        "\nMax Crew: " + ship.maxcrew + 
                        "\nStore: https://robertsspaceindustries.com" + ship.url);
          });
        } else {
          myBot.reply(message, "Sir, I require a ship name.");
        }
      }
    }
    
    /**
    * Roll. Roll a die.
    */
    if(message.content.indexOf('!roll') > -1) {
      var rollSplit = message.content.split(" ");
      if(rollSplit.length < 2) {
        return myBot.reply(message, "You need to give me a max number to roll!\nExample:\n   !roll 20\nFor a D20 Die");
      }
      var rolled = roll(rollSplit[1]);
      if(!isNaN(parseFloat(roll)))
        return myBot.reply(message, "You rolled a " + rolled);
      else
        return myBot.reply(message, "You did not seem to give a number.\nExample:\n   !roll 20\nFor a D20 Die");
    }

    /**
     * Definition. Get a definition of a word.
     */
    if(message.content.indexOf('!def') > -1) {
      var word = message.content.match(/.*!def *([^\n\r]*)/);
      Wordnet.lookup(word[1], function(err, defs) {
        if(err) {
          return myBot.reply(message, "That does not seem to be an English word...");
        }
        defs.forEach(function (def){
          myBot.reply(message, "The definition of: '" + word[1] + "' is:\n" + def.glossary);
        });
      });
    }

    /**
     * Check how much credits a player has. Private messages amount.
     */
    if(message.content.indexOf('!cred') > -1) {
      if(players[message.author.id]) {
        myBot.sendMessage(message.author, "Credit Amount: " + players[message.author.id].credits);
      }
    }

    /**
     * Blackjack. A game to play. Uses credits.
     */
    if(message.content.indexOf('!blackjack') > -1) {
      var split = message.content.split(" ");
      if(split.length > 1) {
        var bet = parseInt(split[1])
        if(players[message.author.id]) {
          if(bet) {
            if(bet > 0) {
              if(players[message.author.id].credits >= bet) {
                  if(!bjGames[message.author.id]) {
                    bjGames[message.author.id] = new BlackJack(bet, function(string) {
                      myBot.reply(message.author, "Please play by PMing me. That way we don't disturb others in public areas.");
                      myBot.reply(message.author, string);
                    });
                  } else {
                    myBot.reply(message, "You are already in a game! Please finish that one before starting another hand.");
                  }
              } else {
                myBot.reply(message, "You do not have that much to bet!");
              }
            } else {
              myBot.reply(message, "You need to actually bet some amount of credits.");
            }
          } else {
            myBot.reply(message, "That does not seem to be a number.");
          }
        } else {
          players[message.author.id] = {};
          player = players[message.author.id];
          player.credits = 1500;
          bjGames[message.author.id] = new BlackJack(bet, function(string) {
            myBot.reply(message, string);
          });
        }
      } else {
        myBot.reply(message, "You need give a betting amount.\n!blackjack <amount>");
      }
    }
  
    /**
     * Hit. Get a new card in blackjack.
     */
    if(message.content === '!hit') {
      if(bjGames[message.author.id]) {
        bjGames[message.author.id].play(true, function(status, string) {
          if(status == 0) {
            myBot.reply(message, string);
          }
          if(status == 1) {
            myBot.reply(message, string);
            players[message.author.id].credits = players[message.author.id].credits + bjGames[message.author.id].bet;
            fs.writeFile( "players.json", JSON.stringify( players ), "utf8", function(err){
              if(err) console.log('Error when saving players!');
            });
            delete bjGames[message.author.id];
            
          }
          if(status == 2) {
            myBot.reply(message, string);
            players[message.author.id].credits = players[message.author.id].credits - bjGames[message.author.id].bet;
            fs.writeFile( "players.json", JSON.stringify( players ), "utf8", function(err){
              if(err) console.log('Error when saving players!');
            });
            delete bjGames[message.author.id];
          }
        });
      } else {
        myBot.reply(message, "You are not in a game!");
      }
    }

    /**
     * Stay. Keep the current hand in blackjack and let house play.
     */
    if(message.content === '!stay') {
      if(bjGames[message.author.id]) {
        bjGames[message.author.id].play(false, function(status, string) {
          if(status == 1) {
            myBot.reply(message, string);
            players[message.author.id].credits = players[message.author.id].credits + bjGames[message.author.id].bet;
            fs.writeFile( "players.json", JSON.stringify( players ), "utf8", function(err){
              if(err) console.log('Error when saving players!');
            });
            delete bjGames[message.author.id];
          }
          if(status == 2) {
            myBot.reply(message, string);
            console.log(string);
            players[message.author.id].credits = players[message.author.id].credits - bjGames[message.author.id].bet;
            fs.writeFile( "players.json", JSON.stringify( players ), "utf8", function(err){
              if(err) console.log('Error when saving players!');
            });
            delete bjGames[message.author.id];
          }
        });
      } else {
        myBot.reply(message, "You are not in a game!");
      }
    }  
  }
});

/**
 * Bots Login
 */
function login() {
  try {
    console.log("Logging in");
    myBot.login(settings.email, settings.password);
  } catch (err) {
    console.log(err);
    if(err) {
      console.log("No login available, trying again in 5 seconds");
      setTimeout(login(), 5000);
    }
  }
}

login();

/**
 * Save the player data on exit command.
 */
process.on('SIGINT', function() {
  fs.writeFile( "players.json", JSON.stringify( players ), "utf8", function(err){
    if(err) console.log('Error when saving players!');
    console.log('\nAll saved\n');
    process.exit();
  });
});