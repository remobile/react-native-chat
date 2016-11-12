var multer = require('multer');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');

const PER_COUNT = 10;
const TEXT = 'fangyunjiang\n:::9::8::7:方运江2342342342342342342342342342342342342342342342343\n';
let MESSAGE = {
    avatar: 'http://localhost:3000/image/1.png',
    name: '阿三',
};
const TIME1 = '2016-11-02 12:11:00';
const TIME2 = '2016-10-05 11:11:11';

module.exports = (function() {
    var _self;

    function Mgr() {
        _self = this;
    }
    Mgr.prototype.register = function(server) {
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
    };
    Mgr.prototype.get_remote = function(url, callback) {
        var remote_req = http.get(url, function(remote_res) {
            callback(remote_res);
        });
        remote_req.end();
    };
    Mgr.prototype.post_remote = function(req, opt, callback) {
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

    return new Mgr();
})();
