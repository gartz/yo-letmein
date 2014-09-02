if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['requirejs', 'argv', 'promises/users'], function(require, argv, users) {

    var fs = require('fs');
    var net = require('net');
    var http = require('http');
    var https = require('https');

    var listen = argv.listen;
    var httpAddress = argv.http;
    var isHttpsOff = argv.httpsOff;
    var insecure = argv.insecure;
    var httpsAddress;
    var privateKey;
    var certificate;
    if (isHttpsOff) {
        insecure = true;
    } else {
        httpsAddress = argv.https;
        privateKey  = fs.readFileSync(argv.key, 'utf8');
        certificate = fs.readFileSync(argv.crt, 'utf8');
    }

    var express = require('express');

    var app = express();

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

    return app;
});

