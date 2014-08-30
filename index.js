var express = require('express');
var Yo = require('yo-api');
var security = require('./users.json');

var app = express();

app.get('/', function(req, res){
    var user = req.query.username ? req.query.username.toUpperCase() : '';
    if (!security[user]) {
        console.log('Security fail for: %s', user);
        return;
    }
    console.log('Opening the door for: %s', user);
    try {
        var gpio = require("pi-gpio");
        gpio.open(12, "output", function(err) {     // Open pin 12 for output
            gpio.write(12, 1, function() {          // Set pin 12 high (1)
                setTimeout(gpio.close.bind(gpio, 16), 6e3);
            });
        });
    } catch(e) {
        console.warn('GPIO FAIL');
    }
    res.send('yo brow');
});

var server = app.listen(8880, function() {
    console.log('Listening on port %d', server.address().port);
});
