module.exports = (function() {
    var _self;
    var fs = require('fs');
    var path = require('path');
    var mongoose = require('mongoose');
    var Grid = require('gridfs-stream');

    function Mgr(db) {
        _self = this;
        _self.gfs = Grid(db, mongoose.mongo);
    }
    Mgr.prototype.saveUserHead = function(filename, path, userid, callback) {
        var extname = path.extname(filename);
        var writestream = _self.gfs.createWriteStream({
            filename
        }).on('close', function (file) {
            var {_id} = file;
            app.db.User._updateUserInfo(userid, {head: _id, headType: extname}, function(doc){
                if (doc.head) {
                    _self.gfs.remove({_id: doc.head})
                }
                callback({head:_id, headType: extname});
                app.socketMgr.notifyOnlineUsers(userid, 'USERS_UPDATE_HEAD_NF', {userid, head:_id, headType: extname});
            });
        });
        fs.createReadStream(__dirname+'/../../'+path).pipe(writestream);
    };
    Mgr.prototype.getUserHead = function(id, res) {
        _self.gfs.exist({_id: id}, function(err, found) {
            if (err || !found) {
                fs.createReadStream(__dirname+'/../../public/img/default_user_head.png').pipe(res);
            } else {
                _self.gfs.createReadStream({_id: id}).pipe(res);
            }
        });
    };

    return Mgr;
})();
