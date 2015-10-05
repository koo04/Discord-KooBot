var Discord = require('discord.js'),
    Wordnet = require('wordnet'),
    Request = require('request'),
    Cheerio = require('cheerio'),
    fs = require("fs"),
    ships = require("./ships.json");;

var myBot = new Discord.Client({queue: true});
var server;
var idle = false;
var reminders = [];
var searching = false;
var players = new Array();


myBot.on('ready', function() {
  server = myBot.getServer();
  server.members.forEach(function(member) {
    if(member.status = 'online') {
      if(!players[member.id]) {
        players[member.id] = {};
        player = players[member.id];
        player.credits = 1500;
        player.games = {};
        
      }
    }
  });
});

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

  if(message.content.indexOf('!links') > -1) {
    var linkSplit = message.content.split(" ");
    if(linkSplit.length > 1) {
      for(var i = 0; i < linkSplit.length; i++) {
        if(linkSplit[i].indexOf('-')) {

        }
      }
    }
  }

  if(message.content.indexOf('!me') > -1) {

  }

  if(message.content.indexOf('!remind') > -1) {
    var task = message.content.match(/.*!remind *([^\n\r]*)/);
    var split = task[1].toString().split(" ");
    var who = split[0];
    var error = false;
    var todo;
    var time;
    var marker;

    for(var i = split.length; i > 0; i--) {
      if(!time && split[i] == 'in') {
        textToTime(split[i+1], split[i+2], function(err, t){
          if(err) { 
            console.log("error");
            error = true;
          }
          time = t;
        });
        marker = i;
      }
    }

    for(var i = 1; i < marker; i++) {
      todo = split[i];
    }

    if(error) {
      myBot.reply(message, "I am not able to save that reminder.");
    } else {
      if(who == "me"){
        reminders.push(setTimeout(function() {
            myBot.sendMessage(message.author, "Reminder: " + todo, function(err, message){
              if(err) myBot.sendMessage(message, "I was not able to find that user");
            });
        }, time));
        myBot.reply(message, "I will remind you.");
      } else {
        who = split[0].match(/<(.*?)>/);
        var id = who[1].replace("@","");
        var user = myBot.getUser("id", id);
        reminders.push(setTimeout(function() {
          console.log(user);
          myBot.sendMessage(user, "Reminder: " + todo, function(err, message){
            if(err) myBot.sendMessage(message, "I was not able to find that user");
          });
        }, time));
        myBot.reply(message, "I will remind them.");
      }
    }
  }
  
  if(message.content === '!status') {
    if(idle)
      myBot.reply(message, "zZzZzZz");
    else
      myBot.reply(message, "I am awaiting orders.");
  }
});

myBot.login('douglas@devicariis.org', 'M@st3r0811');

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");

    if (i_should_exit)
        process.exit();
});