module.exports = define(function(require) {
    var _self;
    function NotifyMgr() {
        _self = this;
    }

    NotifyMgr.prototype.onNotify = function(obj) {
        app.socket.emit('USERS_NOTIFY_NFS');
        for (var i= 0,len=obj.length; i<len; i++) {
            _self.updateUserHead(obj[i]);
        }
    };
    NotifyMgr.prototype.updateUserHead = function(obj) {
        var userid = obj.userid;
        var head = obj.head;
        app.console.log("red@:"+userid, head);
    };

    return new NotifyMgr();
});


