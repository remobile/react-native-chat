module.exports = (function() {
    var _self;
    var fs = require('fs');
    var _path = require('path');
    var mongoose = require('mongoose');
    var Grid = require('gridfs-stream');

    function Mgr(db) {
        _self = this;
        _self.gfs = Grid(db, mongoose.mongo);
    }
    Mgr.prototype.saveUserHead = function(filename, path, userid, callback) {
        var writestream = _self.gfs.createWriteStream({
            filename
        }).on('close', function (file) {
            var {_id} = file;
            var extname = _path.extname(filename);
            app.db.User._updateUserInfo(userid, {head: _id+extname}, function(doc){
                if (doc.head) {
                    var id = doc.head.replace(/(.*)\..*/, '$1');
                    _self.gfs.remove({_id: id})
                }
                callback({head:_id});
                app.socketMgr.notifyOnlineUsers(userid, 'USERS_UPDATE_HEAD_NF', {userid, head:_id});
            });
        });
        fs.createReadStream(__dirname+'/../../'+path).pipe(writestream);
    };
    Mgr.prototype.getUserHead = function(head, res) {
        var id = head.replace(/(.*)\..*/, '$1');
        _self.gfs.exist({_id: id}, function(err, found) {
            if (err || !found) {
                res.sendStatus(404);
            } else {
                _self.gfs.createReadStream({_id: id}).pipe(res);
            }
        });
    };

    return Mgr;
})();
