(function() {
    var _self;
    global._ = require('underscore');
    var express = require('express')();
    var mongourl;
    var port = process.env.VCAP_APP_PORT||8888;
    if (process.env.VCAP_SERVICES) {
        var env = JSON.parse(process.env.VCAP_SERVICES);
        mongourl = env['mongodb2-2.4.8'][0]['credentials'].url;
    } else {
        mongourl = "mongodb://127.0.0.1:27017/MRPCHAT";
    }

    function App() {
        _self = this;
        var modulePath = __dirname+'/modules/';
        _self.server = require('http').Server(express);
        _self.io = require('socket.io')(_self.server);
        _self.error = require(modulePath+'utils/error');
        _self.console = require(modulePath+'utils/console');
        _self.socketMgr = require(modulePath+'socketMgr/socketMgr');
        _self.expressMgr = require(modulePath+'socketMgr/expressMgr');
        _self.router = require(modulePath+'socketMgr/router');
        _self.userMgr = require(modulePath+'userMgr/userMgr');
        _self.onlineUserMgr = require(modulePath+'userMgr/onlineUserMgr');
        _self.notifyMgr = require(modulePath+'userMgr/notifyMgr');
        _self.messageMgr = require(modulePath+'messageMgr/messageMgr');
        _self.groupMgr = require(modulePath+'groupMgr/groupMgr');
        _self.callMgr = require(modulePath+'callMgr/callMgr');
        _self.db = require(modulePath+'mongodbMgr/mongodbMgr');
    }


    App.prototype.start = function() {
        app.db.start(mongourl, function() {
            app.expressMgr.start(express, function() {
                app.socketMgr.start(function() {
                    _self.server.listen(port, function(){
                        console.log("listen on port "+port);
                    });
                });
            });
        })
    };

    app = new App();
    app.start();
})();

