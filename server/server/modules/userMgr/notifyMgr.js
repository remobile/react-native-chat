module.exports = (function() {
    var _self;
    function NotifyMgr() {
        _self = this;
    }
    NotifyMgr.prototype.sendUserNotify = function(socket) {
        app.db.UserNotify._get(socket.userid, function (docs) {
            socket.emit('USERS_NOTIFY_NF', docs);
        });
    };
    NotifyMgr.prototype.add = function(userid) {
        app.db.UserNotify._init(userid);
    };
    NotifyMgr.prototype.addNotify = function(userid, type) {
        var mgr = app.onlineUserMgr;
        var onlineUsers = mgr.onlineUsers;
        var users = [];
        for (var id in onlineUsers) {
            users.push(id);
        }
        var allusers = [];
        app.db.User.find(function (err, docs) {
            _.map(docs, function(doc){
                allusers.push(doc.userid);
            });
            app.db.UserNotify._add(type, _.difference(allusers, users), userid);
        });
    };
    NotifyMgr.prototype.clearNotify = function(socket) {
        app.db.UserNotify._clear(socket.userid);
    };
    NotifyMgr.prototype.dealMrpNotify = function(type, users, msg) {
        switch (type) {
            case 'NOTIFY_TICKET_ISSUE':
                break;
            case 'NOTIFY_TICKET_REPLY':
                break;
            case 'NOTIFY_WORK_NOTICE':
                break;
            default:
                return false;
        }
        return true;
    };

    return new NotifyMgr();
})();
