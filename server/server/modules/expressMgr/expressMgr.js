module.exports = (function() {
    var express = require('express');
    var http = require('http');
    var bodyParser = require('body-parser');
    var url=require('url');
    var path = require('path');
    var _self;

    function ExpressMgr() {
        _self = this;
    }

    ExpressMgr.prototype.start = function(server, callback) {
        var wwwPath = path.join(__dirname, "..", "..", "www");

        server.use(bodyParser.urlencoded({ extended: false }));
        server.use(bodyParser.json({limit: '100mb'}));
        server.use(bodyParser.text({limit: '100mb'}));

        //server.engine('.html', require('ejs').__express);
        //server.set('view engine', 'html');
        server.set('views', wwwPath);
        server.use(express.static(wwwPath));

        server.get('/', function (req, res) {
            res.sendFile('index.html');
            //res.render('index.html');
        });
        server.post('/proxy', function (req, res) {
            var opt = req.body;
            if (opt.type == 'POST') {
                _self.post_remote(req, opt, function(response) {
                    response.pipe(res);
                });
            } else {
                _self.get_remote(opt.url, function(response) {
                    response.pipe(res);
                });
            }
        });
        server.post('/notify', function (req, res) {
            var obj;
            try {
                obj = JSON.parse(req.body);
            } catch (e) {
                res.send(JSON.stringify({success:false}));
                return;
            }
            var result = app.notifyMgr.dealMrpNotify(obj.type, obj.users, obj.msg);
            res.send(JSON.stringify({success:result}));
        });
        callback();
    };
    ExpressMgr.prototype.get_remote = function(url, callback) {
        var remote_req = http.get(url, function(remote_res) {
            callback(remote_res);
        });
        remote_req.end();
    };
    ExpressMgr.prototype.post_remote = function(req, opt, callback) {
        var remoteurl = url.parse(opt.url);
        var data = opt.data;

        var contentType = 'application/x-www-form-urlencoded';
        if (typeof data == 'object') {
            contentType = 'application/json';
            data = JSON.stringify(data);
        }

        var options = {
            host: remoteurl.hostname,
            port: remoteurl.port,
            path: remoteurl.path,
            method: 'POST',
            headers:{
                'Content-Type':contentType,
            }
        };
        console.log(options);
        var remote_req = http.request(options, function(remote_res) {
            callback(remote_res);
        });
        remote_req.end(data);
    };

    return new ExpressMgr();
})();
