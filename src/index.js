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

requirejs([
    'server',
    'promises/users',
    'argv',
    'request'
], function (
    server,
    users,
    argv,
    request
){
    'use strict';
    var insecure = argv.insecure;

    server.get('/', function(req, res){
        console.log(req.ips);

        users().catch(function (){
            res.send('Internal error');
        }).then(function (usersList) {
            var user = req.query.username ? req.query.username.toUpperCase() : '';
            if (!usersList){
                if (!insecure){
                    console.error('Security failure, invalid users.json file');
                    res.send('error');
                    return;
                }
                console.warn('No users white list. User [%s] granted', user);
            } else if (!usersList[user]) {
                console.log('Security fail for: %s', user);
                res.send('error');
                return;
            }
            console.log('Opening the door for: %s', user);
            request('http://192.168.1.8/?pin=OFF1', function () {
                setTimeout(function(){
                    request('http://192.168.1.8/?pin=ON1', function () {});
                }, 6e3);
            });
            res.send('yo brow');
        });
    });
});
