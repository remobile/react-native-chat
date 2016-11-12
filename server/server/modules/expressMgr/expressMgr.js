module.exports = (function() {
    var express = require('express');
    var http = require('http');
    var bodyParser = require('body-parser');
    var url=require('url');
    var path = require('path');
    var _self;

    var modules = [
        'proxy',
        'userHead',
    ];

    function ExpressMgr() {
        _self = this;
    }

    ExpressMgr.prototype.start = function(server, callback) {
        server.use(bodyParser.urlencoded({ extended: false }));
        server.use(bodyParser.json({limit: '100mb'}));
        server.use(bodyParser.text({limit: '100mb'}));
        server.use(express.static(__dirname + '/../../public'));

        for (var i in modules) {
            require('./'+modules[i]).register(server);
        }
        callback();
    };
    return new ExpressMgr();
})();
