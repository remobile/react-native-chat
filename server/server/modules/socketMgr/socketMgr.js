module.exports = (function() {
    var _self;

    function SocketMgr() {
        _self = this;
    }
    SocketMgr.prototype.notifyOtherUsers = function(users, userid, msg_type, obj) {
        var mgr = app.onlineUserMgr;
        for (var i=0,len=users.length; i<len; i++) {
            if (users[i] == userid) {
                continue;
            }
            var client = mgr.getClient(users[i]);
            if (client) {
                app.io.to(client.socketid).emit(msg_type, obj);
            }
        }
    };
    SocketMgr.prototype.notifyOnlineUsers = function(userid, msg_type, obj) {
        var mgr = app.onlineUserMgr;
        var onlineUsers = mgr.onlineUsers;
        for (var id in onlineUsers) {
            if (id == userid) {
                continue;
            }
            app.io.to(onlineUsers[id].socketid).emit(msg_type, obj);
        }
    };
    SocketMgr.prototype.start = function(callback) {
        app.io.on('connection', function (socket) {
            console.log('socket connected');
            socket.on('disconnect', function(){
                console.log('socket disconnect');
                app.router.ON_DISCONNECT(socket);
            }).on('USER_LOGIN_RQ', function(obj){
                app.router.ON_USER_LOGIN_RQ(socket, obj);
            }).on('USER_LOGIN_SUCCESS_NFS', function(obj){
                app.router.ON_USER_LOGIN_SUCCESS_NFS(socket, obj);
            }).on('USER_REGISTER_RQ', function(obj){
                app.router.ON_USER_REGISTER_RQ(socket, obj);
            }).on('USER_SEND_MESSAGE_RQ', function(obj){
                app.router.ON_USER_SEND_MESSAGE_RQ(socket, obj);
            }).on('USER_MESSAGE_NFS', function(obj){
                app.router.ON_USER_MESSAGE_NFS(socket, obj);
            }).on('USER_OFFONLINE_MESSAGE_NFS', function(){
                app.router.ON_USER_OFFONLINE_MESSAGE_NFS(socket);
            }).on('USER_GET_MESSAGE_RQ', function(obj){
                app.router.ON_USER_GET_MESSAGE_RQ(socket, obj);
            }).on('USERS_NOTIFY_NFS', function(){
                app.router.ON_USERS_NOTIFY_NFS(socket);
            }).on('USERS_UPDATE_USERINFO_RQ', function(obj){
                app.router.ON_USERS_UPDATE_USERINFO_RQ(socket, obj);
            }).on('GROUP_LIST_RQ', function(obj){
                app.router.ON_GROUP_LIST_RQ(socket, obj);
            }).on('GROUP_INFO_RQ', function(obj){
                app.router.ON_GROUP_INFO_RQ(socket, obj);
            }).on('GROUP_CREATE_RQ', function(obj){
                app.router.ON_GROUP_CREATE_RQ(socket, obj);
            }).on('GROUP_MODIFY_RQ', function(obj){
                app.router.ON_GROUP_MODIFY_RQ(socket, obj);
            }).on('GROUP_DELETE_RQ', function(obj){
                app.router.ON_GROUP_DELETE_RQ(socket, obj);
            }).on('GROUP_JOIN_RQ', function(obj){
                app.router.ON_GROUP_JOIN_RQ(socket, obj);
            }).on('GROUP_LEAVE_RQ', function(obj){
                app.router.ON_GROUP_LEAVE_RQ(socket, obj);
            }).on('GROUP_PULL_IN_RQ', function(obj){
                app.router.ON_GROUP_PULL_IN_RQ(socket, obj);
            }).on('GROUP_FIRE_OUT_RQ', function(obj){
                app.router.ON_GROUP_FIRE_OUT_RQ(socket, obj);
            }).on('CALL_WEBRTC_SIGNAL_NFS', function(obj){
                app.router.ON_CALL_WEBRTC_SIGNAL_NFS(socket, obj);
            }).on('CALL_OUT_RQ', function(obj){
                app.router.ON_CALL_OUT_RQ(socket, obj);
            }).on('CALL_HANGUP_RQ', function(obj){
                app.router.ON_CALL_HANGUP_RQ(socket, obj);
            }).on('CALL_IN_NFS', function(obj){
                app.router.ON_CALL_IN_NFS(socket, obj);
            });
        });
        callback();
    };
    return new SocketMgr();
})();
