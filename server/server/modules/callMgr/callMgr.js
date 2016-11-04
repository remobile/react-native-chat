module.exports = (function() {
    var _self;

    function CallMgr() {
        _self = this;
    }

    CallMgr.prototype.callOut = function(socket, obj) {
        console.log('callOut', obj);
        var userid = obj.userid;
        var client = app.onlineUserMgr.getClient(userid);
        if (client) {
            socket.emit('CALL_OUT_RS', obj);
            obj.userid = socket.userid;
            app.io.to(client.socketid).emit('CALL_IN_NF', obj);
        } else {
            obj.error = app.error.USER_NOT_NOLINE;
            socket.emit('CALL_OUT_RS', obj);
        }
    };
    CallMgr.prototype.callInReply = function(socket, obj) {
        console.log('callInReply', obj);
        var userid = obj.userid;
        var client = app.onlineUserMgr.getClient(userid);
        if (client) {
            obj.userid = socket.userid;
            app.io.to(client.socketid).emit('CALL_IN_REPLY_NF', obj);
        }
    };
    CallMgr.prototype.callHangup = function(socket, obj) {
        console.log('callHangup', obj);
        var userid = obj.userid;
        var client = app.onlineUserMgr.getClient(userid);
        if (client) {
            socket.emit('CALL_HANGUP_RS', obj);
            obj.userid = socket.userid;
            app.io.to(client.socketid).emit('CALL_HANGUP_NF', obj);
        } else {
            obj.error = app.error.USER_NOT_NOLINE;
            socket.emit('CALL_RING_RS', obj);
        }
    };
    CallMgr.prototype.callWebrtcSignal = function(socket, obj) {
        console.log('callWebrtcSignal', obj);
        var userid = obj.userid;
        var client = app.onlineUserMgr.getClient(userid);
        if (client) {
            obj.userid = socket.userid;
            app.io.to(client.socketid).emit('CALL_WEBRTC_SIGNAL_NF', obj);
        }
    };

    return new CallMgr();
})();


