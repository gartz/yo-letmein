var packagejson = require('../package.json');

if (process.env.NODE_ENV !== 'production'){
    require('longjohn');
}

var fs = require('fs');
var net = require('net');
var http = require('http');
var https = require('https');

var yargs = require('yargs')
    .default('listen', 8880)
    .alias('l', 'listen')
    .default('http', './http.sock')
    .default('https', './https.sock')
    .default('key', 'sslcert/server.key')
    .alias('k', 'key')
    .default('crt', 'sslcert/server.crt')
    .alias('c', 'crt')
    .boolean('insecure')
    .alias('i', 'insecure')
    .boolean('httpsOff')
    .alias('v', 'version')
    .version(packagejson.version, 'version')
    .showHelpOnFail(false, "Specify --help for available options");

var argv = yargs.argv;
if (argv.help) {
    console.log(yargs.help());
    return;
}


var listen = argv.listen;
var httpAddress = argv.http;
var isHttpsOff = argv.httpsOff;
var insecure = argv.insecure;
if (isHttpsOff) {
    insecure = true;
} else {
    var httpsAddress = argv.https;
    var privateKey  = fs.readFileSync(argv.key, 'utf8');
    var certificate = fs.readFileSync(argv.crt, 'utf8');
}

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
    var text = '';
    if (addr.port){
        text = [
            addr.address,
            ':',
            addr.port,
            ' [' + addr.family + ']'
        ].join('');
    } else {
        text = fs.realpathSync(addr);
    }
    console.log('Listening on %s', text);
}

[listen, httpAddress, httpsAddress].forEach(function (addr){
    if (!fs.existsSync(addr)) return;
    fs.unlinkSync(addr);
});

net.createServer(function (conn){
    conn.once('data', function (buf) {
        // A TLS handshake record starts with byte 22.
        var address = (buf[0] === 22) ? httpsAddress : httpAddress;
        if (isHttpsOff) address = httpAddress;
        var proxy = net.createConnection(address, function () {
            proxy.write(buf);
            conn.pipe(proxy).pipe(conn);
        });
    });
}).listen(listen, serverCallback);

var redirectApp = function (req, res){
    var host = req.headers.host;
    res.writeHead(301, { "Location": "https://" + host + req.url });
    res.end();
};

var httpApp = app;
if (!insecure){
    console.log('Secure mode enable, HTTP redirecting to HTTPS');
    httpApp = redirectApp;
}

console.log('Starting HTTP support');
http.createServer(httpApp).listen(httpAddress, serverCallback);
if (!isHttpsOff) {
    console.log('Starting HTTPS support');
    https.createServer({
        key: privateKey,
        cert: certificate
    }, app).listen(httpsAddress, serverCallback);
}
