var fs = require('fs');
var net = require('net');
var http = require('http');
var https = require('https');

var port = 8880;
var httpAddress = './http.sock';
var httpsAddress = './https.sock';
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

var express = require('express');
var Yo = require('yo-api');
var users = require('./users.json');

var app = express();

app.get('/', function(req, res){
    var user = req.query.username ? req.query.username.toUpperCase() : '';
    if (!users[user]) {
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

function serverCallback() {
    var addr = this.address();
    console.log('Listening on %s', addr.port ? addr.port : fs.realpathSync(addr));
}

[port, httpAddress, httpsAddress].forEach(function (addr){
    if(!fs.existsSync(addr)) return;
    fs.unlinkSync(addr);
});

net.createServer(function (conn){
    conn.once('data', function (buf) {
        // A TLS handshake record starts with byte 22.
        var address = (buf[0] === 22) ? httpsAddress : httpAddress;
        var proxy = net.createConnection(address, function () {
            proxy.write(buf);
            conn.pipe(proxy).pipe(conn);
        });
    });
}).listen(port, serverCallback);

http.createServer(app).listen(httpAddress, serverCallback);
https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(httpsAddress, serverCallback);
