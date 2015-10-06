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

var myBot = new Discord.Client({queue: true});
var server;
var idle = false;
var reminders = [];
var searching = false;
var bjGames = new Array();

function textToTime(time, kind, callback){
  if(kind == "seconds" || kind == "second")
    return callback(false, parseInt(time) * 1000);
  
  if(kind == "minutes" || kind == "minute")
    return callback(false, parseInt(time) * 60 * 1000);
  
  if(kind == "hours" || kind == "hour")
    return callback(false, parseInt(time) * 60 * 1000);
    
  return callback(true, null);
};

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

myBot.on('serverNewMember', function(user, server) {
  myBot.sendMessage('#general',user.mention() + " Welcome to Sol Armada! \nPlease make sure to visit the website and forums! \nhttp://solarmada.com/", function(err, message) {
    if(err) console.log("Yup error");
  });
});

myBot.on('message', function(message){
  if(message.content.charAt(0) === '!'){
    if(message.content === "!ping")
      myBot.reply(message, "pong");

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

    if(message.content === "!ping")
      myBot.reply(message, "pong");

  //    if(message.content === '!dance') {
  //      myBot.reply(message, "\n (•\_•)\n <)  )-   Don't cha wish\n /  \\\n (•_•)\n √( (>   your girlfriend was\n  /  \\\n (•_•)/\n <)  )   hot like me\n /  \\");
  //    }

  //  if(message.content.indexOf('!links') > -1) {
  //    var linkSplit = message.content.split(" ");
  //    if(linkSplit.length > 1) {
  //      for(var i = 0; i < linkSplit.length; i++) {
  //        if(linkSplit[i].indexOf('-')) {
  //
  //        }
  //      }
  //    }
  //  }

  /**
   * Credit Amount
  **/
    if(message.content.indexOf('!cred') > -1) {
      if(players[message.author.id]) {
        myBot.sendMessage(message.author, "Credit Amount: " + players[message.author.id].credits);
      }
    }

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
                      myBot.reply(message, string);
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
      }
    }

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

  /**
   * Reminders
  **/
  //  if(message.content.indexOf('!remind') > -1) {
  //    var task = message.content.match(/.*!remind *([^\n\r]*)/);
  //    var split = task[1].toString().split(" ");
  //    var who = split[0];
  //    var error = false;
  //    var todo;
  //    var time;
  //    var marker;
  //
  //    for(var i = split.length; i > 0; i--) {
  //      if(!time && split[i] == 'in') {
  //        textToTime(split[i+1], split[i+2], function(err, t){
  //          if(err) { 
  //            console.log("error");
  //            error = true;
  //          }
  //          time = t;
  //        });
  //        marker = i;
  //      }
  //    }
  //
  //    for(var i = 1; i < marker; i++) {
  //      todo = split[i];
  //    }
  //
  //    if(error) {
  //      myBot.reply(message, "I am not able to save that reminder.");
  //    } else {
  //      if(who == "me"){
  //        reminders.push(setTimeout(function() {
  //            myBot.sendMessage(message.author, "Reminder: " + todo, function(err, message){
  //              if(err) myBot.sendMessage(message, "I was not able to find that user");
  //            });
  //        }, time));
  //        myBot.reply(message, "I will remind you.");
  //      } else {
  //        who = split[0].match(/<(.*?)>/);
  //        var id = who[1].replace("@","");
  //        var user = myBot.getUser("id", id);
  //        reminders.push(setTimeout(function() {
  //          console.log(user);
  //          myBot.sendMessage(user, "Reminder: " + todo, function(err, message){
  //            if(err) myBot.sendMessage(message, "I was not able to find that user");
  //          });
  //        }, time));
  //        myBot.reply(message, "I will remind them.");
  //      }
  //    }
  //  }

  //  if(message.content === '!status') {
  //    if(idle)
  //      myBot.reply(message, "zZzZzZz");
  //    else
  //      myBot.reply(message, "I am awaiting orders.");
  //  }
  
  }
});

myBot.login('douglas@devicariis.org', 'M@st3r0811');

process.on('SIGINT', function() {
  fs.writeFile( "players.json", JSON.stringify( players ), "utf8", function(err){
    if(err) console.log('Error when saving players!');
    console.log('All saved');
    process.exit();
  });
});