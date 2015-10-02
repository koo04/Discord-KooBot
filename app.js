var Discord = require('discord.js'),
    Wordnet = require('wordnet');

var myBot = new Discord.Client({queue: true});

var idle = false;

var games = [];

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

myBot.login('douglas@devicariis.org', 'M@st3r0811');