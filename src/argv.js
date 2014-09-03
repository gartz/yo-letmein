if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require) {
    var packagejson = require('../package.json');
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
        process.exit();
    }

    return argv;
});
