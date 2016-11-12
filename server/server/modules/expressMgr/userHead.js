var multer = require('multer');
var path = require('path');
var fs = require('fs');

module.exports = (function() {
    function Mgr() {}
    Mgr.prototype.register = function(server) {
        server.post('/api/uploadUserHead', multer({dest: 'public/temp/'}).single('file'), function (req, res) {
            var {originalname, path} = req.file;
            app.db.gridfs.saveUserHead(originalname, path, req.body.userid, function(obj) {
                res.send(JSON.stringify(obj));
            });
        });
        server.get('/api/getUserHead', function (req, res) {
            app.db.gridfs.getUserHead(req.query.id, res);
        });
    };

    return new Mgr();
})();
