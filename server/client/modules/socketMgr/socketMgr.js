var _self;

function SocketMgr() {
    _self = this;
}

SocketMgr.prototype.start = function() {
    app.socket.on('connect', function(obj) {
        app.console.log("connect to server");
        app.router.ON_CONNECT();
    }).on('disconnect', function(obj) {
        app.console.log("disconnect to server");
        app.router.ON_DISCONNECT();
    }).on('connect_error', function(obj) {
        app.console.error("connect to server error");
    }).on('connect_timeout', function(obj) {
        app.console.error("connect to server timeout");
    }).on('reconnect', function(obj) {
        app.console.log("magenta@reconnect to server");
        app.router.ON_RECONNECT();
    }).on('reconnect_failed', function(obj) {
        app.console.error("reconnect to server failed");
    }).on('USER_REGISTER_RS', function(obj) {
        app.router.ON_USER_REGISTER_RS(obj);
    }).on('USER_REGISTER_NF', function(obj) {
        app.router.ON_USER_REGISTER_NF(obj);
    }).on('USER_LOGIN_RS', function(obj) {
        app.router.ON_USER_LOGIN_RS(obj);
    }).on('USER_LOGOUT_NF', function(obj) {
        app.router.ON_USER_LOGOUT_NF(obj);
    }).on('USER_LOGIN_NF', function(obj) {
        app.router.ON_USER_LOGIN_NF(obj);
    }).on('USERS_LIST_NF', function(obj) {
        app.router.ON_USERS_LIST_NF(obj);
    }).on('GROUP_LIST_NF', function(obj) {
        app.router.ON_GROUP_LIST_NF(obj);
    }).on('USERS_NOTIFY_NF', function(obj) {
        app.router.ON_USERS_NOTIFY_NF(obj);
    }).on('USER_SEND_MESSAGE_RS', function(obj) {
        app.router.ON_USER_SEND_MESSAGE_RS(obj);
    }).on('USER_MESSAGE_NF', function(obj) {
        app.router.ON_USER_MESSAGE_NF(obj);
    }).on('USER_MESSAGE_RECEIVED_NF', function(obj) {
        app.router.ON_USER_MESSAGE_RECEIVED_NF(obj);
    }).once('USER_OFFONLINE_MESSAGE_NF', function(obj) {
        app.router.ON_USER_OFFONLINE_MESSAGE_NF(obj);
    }).on('USER_GET_MESSAGE_RS', function(obj) {
        app.router.ON_USER_GET_MESSAGE_RS(obj);
    }).on('USERS_UPDATE_HEAD_NF', function(obj) {
        app.router.ON_USERS_UPDATE_HEAD_NF(obj);
    }).on('USERS_UPDATE_USERINFO_RS', function(obj) {
        app.router.ON_USERS_UPDATE_USERINFO_RS(obj);
    }).on('USERS_UPDATE_USERINFO_NF', function(obj) {
        app.router.ON_USERS_UPDATE_USERINFO_NF(obj);
    }).on('GROUP_LIST_RS', function(obj) {
        app.router.ON_GROUP_LIST_RS(obj);
    }).on('GROUP_INFO_RS', function(obj) {
        app.router.ON_GROUP_INFO_RS(obj);
    }).on('GROUP_CREATE_RS', function(obj) {
        app.router.ON_GROUP_CREATE_RS(obj);
    }).on('GROUP_MODIFY_RS', function(obj) {
        app.router.ON_GROUP_MODIFY_RS(obj);
    }).on('GROUP_DELETE_RS', function(obj) {
        app.router.ON_GROUP_DELETE_RS(obj);
    }).on('GROUP_DELETE_NF', function(obj) {
        app.router.ON_GROUP_DELETE_NF(obj);
    }).on('GROUP_JOIN_RS', function(obj) {
        app.router.ON_GROUP_JOIN_RS(obj);
    }).on('GROUP_JOIN_NF', function(obj) {
        app.router.ON_GROUP_JOIN_NF(obj);
    }).on('GROUP_LEAVE_RS', function(obj) {
        app.router.ON_GROUP_LEAVE_RS(obj);
    }).on('GROUP_LEAVE_NF', function(obj) {
        app.router.ON_GROUP_LEAVE_NF(obj);
    }).on('GROUP_PULL_IN_RS', function(obj) {
        app.router.ON_GROUP_PULL_IN_RS(obj);
    }).on('GROUP_PULL_IN_NF', function(obj) {
        app.router.ON_GROUP_PULL_IN_NF(obj);
    }).on('GROUP_FIRE_OUT_RS', function(obj) {
        app.router.ON_GROUP_FIRE_OUT_RS(obj);
    }).on('GROUP_FIRE_OUT_NF', function(obj) {
        app.router.ON_GROUP_FIRE_OUT_NF(obj);
    });
};
module.exports = new SocketMgr();
