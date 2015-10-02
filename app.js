var Discord = require('discord.js'),
    Wordnet = require('wordnet'),
    Request = require('request'),
    Cheerio = require('cheerio'),
    fs = require("fs"),
    ships = require("./ships.json");;

var myBot = new Discord.Client({queue: true});
var idle = false;
var reminders = [];

function textToTime(time, kind, callback){
  if(kind == "seconds" || kind == "second")
    return callback(false, parseInt(time) * 1000);
  
  if(kind == "minutes" || kind == "minute")
    return callback(false, parseInt(time) * 60 * 1000);
  
  if(kind == "hours" || kind == "hour")
    return callback(false, parseInt(time) * 60 * 1000);
    
  return callback(true, null);
};

console.log(ships['data'][1]);

myBot.on('serverNewMember', function(user, server) {
  myBot.sendMessage('#general',user.mention() + " Welcome to Sol Armada! \nPlease make sure to visit the website and forums! \nhttp://solarmada.com/", function(err, message) {
    if(err) console.log("Yup error");
  });
});

myBot.on('message', function(message){
  if(!idle){
    if(message.content === '!sleep') {
      myBot.reply(message, "I will go to sleep until told to !wake");
      myBot.setStatusIdle();
      idle = true;
    }
    
    if(message.content === "!ping")
      myBot.reply(message, "pong");
    
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
        if(!todo && split[i] == 'to') {
          todo = split[i+1];
        }
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
  } else {
    if(message.content === '!wake') {
      myBot.reply(message, "I am awake and here to serve.");
      myBot.setStatusOnline();
      idle = false;
    }
  }
  
  if(message.content === '!status') {
    if(idle)
      myBot.reply(message, "zZzZzZz");
    else
      myBot.reply(message, "I am awaiting orders.");
  }
});

//myBot.login('douglas@devicariis.org', 'M@st3r0811');