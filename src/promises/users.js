if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['requirejs', 'argv'], function(require, argv) {
    var Q = require('q');
    var nodefs = require('fs');
    var fsExtra = require('fs-extra');
    var fs = require('q-io/fs');

    var realpath = Q.nbind(nodefs.realpath);
    var ensureFile = Q.nbind(fsExtra.ensureFile);

    function getUserHome() {
        return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    }

    var configPath = getUserHome() + '/.yo-letmein/';
    var usersPath = configPath + 'users.json';

    return function() {
        var defer = Q.defer();
        function read() {
            fs.read(usersPath, 'b')
            .then(function (content){
                try{
                    var json = JSON.parse(content);
                    defer.resolve(json);
                    console.info('File readed: %s', usersPath);
                } catch(e) {
                    console.error('Could not read users.json file, check the syntax.');
                    defer.resolve();
                }
            });
        }

        realpath(configPath)
        .then(function () {
            console.info('Resolved path: %s', configPath);
            return read();
        }, function (e) {
            return ensureFile(usersPath).done(function () {
                console.log('Users file not found, creating users.json on path: %s', usersPath);
                return read();
            });
        });

        return defer.promise;
    };
});
