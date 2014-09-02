if (process.env.NODE_ENV !== 'production'){
    require('longjohn');
    require('q').longStackSupport = true;
}
var requirejs = require('requirejs');

requirejs.config({
    //Use node's special variable __dirname to
    //get the directory containing this file.
    //Useful if building a library that will
    //be used in node but does not require the
    //use of node outside
    baseUrl: __dirname,

    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});

requirejs(['server', 'promises/users'], function (server, users){
    server.get('/', function(req, res){
        users().catch(function (){
            res.send('Internal error');
        }).then(function (usersList) {
            var user = req.query.username ? req.query.username.toUpperCase() : '';
            if (!usersList){
                console.log('No users white list. User [%s] granted', user);
            } else if (!usersList[user]) {
                console.log('Security fail for: %s', user);
                res.send('error');
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
    });
});
