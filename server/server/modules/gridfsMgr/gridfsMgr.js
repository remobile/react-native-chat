module.exports = (function() {
    var _self;
    var fs = require('fs');
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
            app.db.User._updateUserInfo(userid, {head: _id}, function(){
                callback({id:_id});
                app.socketMgr.notifyOnlineUsers(userid, 'USERS_UPDATE_HEAD_NF', {userid, head:_id});
            });
        });
        fs.createReadStream(__dirname+'/../../'+path).pipe(writestream);
    };
    Mgr.prototype.getUserHead = function(id, res) {
        _self.gfs.createReadStream({_id: id}).pipe(res);
    };

    return Mgr;
})();
