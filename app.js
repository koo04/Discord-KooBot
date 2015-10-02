var Discord = require('discord.js'),
    Feed = require('feed-read'),
    Wordnet = require('wordnet');

var myBot = new Discord.Client({queue: true});

var idle = false;

myBot.on('message', function(message){
  if(!idle){
    if(message.content === '!sleep') {
      myBot.reply(message, "I will go to sleep until told to !wake");
      idle = true;
    }
    
//    if(message.content === "!ping")
//      myBot.reply(message, "pong");

//    if(message.content === '!dance') {
//      myBot.reply(message, "\n (•\_•)\n <)  )-   Don't cha wish\n /  \\\n (•_•)\n √( (>   your girlfriend was\n  /  \\\n (•_•)/\n <)  )   hot like me\n /  \\");
//    }
    
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