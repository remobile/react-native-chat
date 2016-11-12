module.exports = (function() {
    function UserMgr() {
    }
    UserMgr.prototype.register = function(socket, obj) {
        app.db.User._add(obj, function(err) {
            socket.emit('USER_REGISTER_RS', {error:err});
            if (obj.head) {
                app.db.UserInfo._update(obj.userid, obj.head, function() {})
            }
            if (!err) {
                app.notifyMgr.add(obj.userid);
            }
            delete obj.password;
            app.socketMgr.notifyOnlineUsers(socket.userid, 'USER_REGISTER_NF', obj);
        });
    };
    UserMgr.prototype.login = function(socket, obj) {
        if (!obj.userid) {
            socket.emit('USER_LOGIN_RS', { error:app.error.USER_ID_NOT_EXIST});
            return;
        }
        app.db.User.findOne({userid:obj.userid}, '-_id -__v', function (err, doc) {
            var error;
            if (!doc) {
                error = app.error.USER_ID_NOT_EXIST;
                socket.emit('USER_LOGIN_RS', {error:error});
            } else if (doc.password!=obj.password) {
                error = app.error.PASSWORD_ERROR;
                socket.emit('USER_LOGIN_RS', {error:error});
            } else {
                app.onlineUserMgr.add(socket, doc);
            }
        });
    };
    UserMgr.prototype.onLoginSuccess = function(socket, obj) {
         app.userMgr.sendUserList(socket);
         app.userMgr.sendGroupList(socket);
         app.notifyMgr.sendUserNotify(socket);
         app.messageMgr.sendOfflineMessage(socket);
    };
    UserMgr.prototype.sendUserList = function(socket) {
        app.db.User.find({}, '-_id -__v -groups -password').lean().exec(function (err, docs) {
            var userid = socket.userid;
            var online = app.onlineUserMgr.getOnlineUserList();
            _.each(docs, function(doc){doc.online = _.indexOf(online, doc.userid)!==-1;});
            socket.emit('USERS_LIST_NF', docs);
        });
    };
    UserMgr.prototype.sendGroupList = function(socket) {
        app.db.User.findOne({userid:socket.userid}, function (err, doc) {
            var groupids = doc.groups;
            app.db.Group.find({id:{$in:groupids}}, '-_id -__v', function(err, docs) {
                socket.emit('GROUP_LIST_NF', docs);
            });
        });
    };
    UserMgr.prototype.updateHead = function(userid, obj) {
        app.db.UserInfo._update(userid, obj.head, function() {
            socket.emit('USERS_UPDATE_HEAD_RS', {error:null});
            app.socketMgr.notifyOnlineUsers(userid, 'USERS_UPDATE_HEAD_NF', {userid, head:obj.head});
            app.notifyMgr.addNotify(userid, 'head');
        });
    };
    UserMgr.prototype.getHead = function(socket, users) {
        app.db.UserInfo._get(users, function(docs) {
            socket.emit('USERS_GET_HEAD_RS', docs);
        });
    };
    UserMgr.prototype.updateUserInfo = function(socket, obj) {
        app.db.User._updateUserInfo(socket.userid, obj, function(){
            socket.emit('USERS_UPDATE_USERINFO_RS', obj);
            app.socketMgr.notifyOnlineUsers(socket.userid, 'USERS_UPDATE_USERINFO_NF', {userid:socket.userid, username:obj.username, sign:obj.sign});
        });
    };

    return new UserMgr();
})();
