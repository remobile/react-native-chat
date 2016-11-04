module.exports = define(function(require) {
    var _self;

    function MessageMgr() {
        _self = this;
        _self.msgid = localStorage.msgid||0;

        //message type
        _self.TEXT_TYPE = 0;
        _self.IMAGE_TYPE = 1;
        _self.AUDIO_TYPE = 2;
        _self.VIDEO_TYPE = 3;

        //user type
        _self.USER_TYPE = 0;
        _self.GROUP_TYPE = 1;
    }

    MessageMgr.prototype.increaseMsgId = function() {
        _self.msgid++;
        if (!_self.msgid) {
            _self.msgid = 1;
        }
        localStorage.msgid = _self.msgid;
    };
    MessageMgr.prototype.sendUserMessage = function(users, msg, msgtype) {
        _self.increaseMsgId();
        app.socket.emit('USER_SEND_MESSAGE_RQ', {type:_self.USER_TYPE, to:users, msg:msg, msgtype:msgtype, msgid:_self.msgid});
    };
    MessageMgr.prototype.sendGroupMessage = function(groupid, msg, msgtype) {
        _self.increaseMsgId();
        app.socket.emit('USER_SEND_MESSAGE_RQ', {type:_self.GROUP_TYPE, to:groupid, msg:msg, msgtype:msgtype, msgid:_self.msgid});
    };
    MessageMgr.prototype.onSendUserMessage = function(obj) {
        if (obj.error) {
            app.console.error(error);
        } else {
            app.console.log("send to "+obj.to+" ["+obj.msgid+"]", "red@"+obj.time, "server success");
        }
    };
    MessageMgr.prototype.showUserMessage = function(obj) {
        if (obj.type == _self.USER_TYPE) {
            app.console.log('red@['+obj.from+']','blue@['+obj.msgid+']:', obj.msg, obj.msgtype, "blue@"+obj.time);
        } else {
            app.console.log('magenta@group:'+obj.groupid, 'red@['+obj.from+']','blue@['+obj.msgid+']:', obj.msg, obj.msgtype, "blue@"+obj.time);
        }
    };
    MessageMgr.prototype.onUserMessageReceived = function(obj) {
        app.console.log('blue@['+obj.msgid+']:', 'red@'+obj.to, 'received');
    };
    MessageMgr.prototype.showOfflineMessage = function(obj) {
        var len = obj.length;
        for (var i=0; i<len; i++) {
            var item = obj[i];
            if (item.type == _self.GROUP_TYPE) {
                app.console.log('magenta@['+item.groupid+']', 'red@['+item.from+']['+item.time+']:', item.msg, item.msgtype);
            } else {
                app.console.log('red@['+item.from+']['+item.time+']:', item.msg, item.msgtype);
            }
        }
    };
    MessageMgr.prototype.getMessage = function(type, counter, time, cnt) {
        if (time == 'null') {
            time = Date.now();
        }
        if (type == _self.GROUP_TYPE) {
            _self.getGroupMessage(counter, time, cnt);
        } else {
            _self.getUserMessage(counter, time, cnt);
        }
    };
    MessageMgr.prototype.getUserMessage = function(counter, time, cnt) {
        app.socket.emit('USER_GET_MESSAGE_RQ', {type:_self.USER_TYPE, counter:counter, time:time, cnt:cnt});
    };
    MessageMgr.prototype.getGroupMessage = function(counter, time, cnt) {
        app.socket.emit('USER_GET_MESSAGE_RQ', {type:_self.GROUP_TYPE, counter:counter, time:time, cnt:cnt});
    };
    MessageMgr.prototype.onGetMessage = function(obj) {
        var msg = obj.msg;
        var len = msg.length;
        if (len == 0) {
            app.console.log("there is no history message");
            return;
        }
        if (obj.type == _self.GROUP_TYPE) {
            for (var i=0; i<len; i++) {
                var item = msg[i];
                app.console.log('magenta@['+item.groupid+']', 'red@['+item.from+']['+item.time+']:', item.msg, item.msgtype);
            }
        } else {
            for (var i=0; i<len; i++) {
                var item = msg[i];
                app.console.log('red@['+item.from+']['+item.time+']:', item.msg, item.msgtype);
            }
        }
    };

    return new MessageMgr();
});


