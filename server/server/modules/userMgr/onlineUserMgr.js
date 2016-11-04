module.exports = (function() {
    function OnlineUserMgr() {
        this.onlineUsers = {};
    }

    OnlineUserMgr.prototype.add = function(socket, obj) {
        console.log(obj);
        var userid = obj.userid,
        onlineUsers = this.onlineUsers;
        if(onlineUsers.hasOwnProperty(userid)) {
            socket.emit('USER_LOGIN_RS', { error:app.error.LOGIN_MORE_TIMES});
            return;
        }
        socket.emit('USER_LOGIN_RS', obj);
        var client = {
            socketid: socket.id,
            userid: userid,
            username: obj.username
        };
        onlineUsers[userid] = client;
        socket.userid = userid;
        socket.broadcast.emit('USER_LOGIN_NF', {userid:userid, username:obj.username});
        app.db.Logger._logEvent('login', userid);
        console.log(userid+' login');
        console.log('there are(is) '+Object.getOwnPropertyNames(onlineUsers).length+' online');
    };
    OnlineUserMgr.prototype.remove = function(socket) {
        var userid = socket.userid,
        onlineUsers = this.onlineUsers;
        if(onlineUsers.hasOwnProperty(userid)) {
            delete onlineUsers[userid];
            socket.broadcast.emit('USER_LOGOUT_NF', {userid:userid});
            app.db.Logger._logEvent('logout', userid);
            console.log(userid+' logout');
            console.log('there are(is) '+Object.getOwnPropertyNames(onlineUsers).length+' online');
        }
    };
    OnlineUserMgr.prototype.getOnlineUserList = function(selfid) {
        return _.keys(this.onlineUsers);
    };
    OnlineUserMgr.prototype.getClient = function(userid) {
        var client = this.onlineUsers[userid];
        return client;
    };

    return new OnlineUserMgr();
})();

