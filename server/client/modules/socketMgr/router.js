
var _self;

function Router() {
    _self = this;
}
Router.prototype.ON_CONNECT = function(obj) {
    app.chatconnect = true;
};
Router.prototype.ON_RECONNECT = function(obj) {
    app.chatconnect = true;
    app.login.loginAgain();
};
Router.prototype.ON_DISCONNECT = function(obj) {
    app.chatconnect = false;
    app.login.online = false;
    app.userMgr.reset();
    app.groupMgr.reset();
};
Router.prototype.ON_USER_REGISTER_RS = function(obj) {
    app.register.onRegister(obj);
};
Router.prototype.ON_USER_REGISTER_NF = function(obj) {
    app.register.onRegisterNotify(obj);
};
Router.prototype.ON_USER_LOGIN_RS = function(obj) {
    app.login.onLogin(obj);
};
Router.prototype.ON_USER_LOGIN_NF = function(obj) {
    if (app.login.online) {
        app.userMgr.online(obj);
    }
};
Router.prototype.ON_USER_LOGOUT_NF = function(obj) {
    if (app.login.online) {
        app.userMgr.offline(obj);
    }
};
Router.prototype.ON_USERS_LIST_NF = function(obj) {
    app.userMgr.addList(obj);
};
Router.prototype.ON_GROUP_LIST_NF = function(obj) {
    app.groupMgr.addList(obj);
};
Router.prototype.ON_USERS_NOTIFY_NF = function(obj) {
    app.notifyMgr.onNotify(obj);
};
Router.prototype.ON_USER_SEND_MESSAGE_RS = function(obj) {
    app.messageMgr.onSendUserMessage(obj);
};
Router.prototype.ON_USER_MESSAGE_NF = function(obj) {
    app.socket.emit('USER_MESSAGE_NFS', {from:obj.from,msgid:obj.msgid});
    app.messageMgr.showUserMessage(obj);
};
Router.prototype.ON_USER_MESSAGE_RECEIVED_NF = function(obj) {
    app.messageMgr.onUserMessageReceived(obj);
};
Router.prototype.ON_USER_OFFONLINE_MESSAGE_NF = function(obj) {
    app.socket.emit('USER_OFFONLINE_MESSAGE_NFS');
    app.messageMgr.showOfflineMessage(obj);
};
Router.prototype.ON_USER_GET_MESSAGE_RS = function(obj) {
    app.messageMgr.onGetMessage(obj);
};
Router.prototype.ON_USERS_UPDATE_HEAD_NF = function(obj) {
    app.notifyMgr.updateUserHead(obj);
};
Router.prototype.ON_USERS_UPDATE_USERINFO_RS = function(obj) {
    app.userInfo.onUpdateUserInfo(obj);
};
Router.prototype.ON_USERS_UPDATE_USERINFO_NF = function(obj) {
    app.console.log(obj);
};
Router.prototype.ON_GROUP_LIST_RS = function(obj) {
    app.groupMgr.onGetGroupList(obj);
};
Router.prototype.ON_GROUP_INFO_RS = function(obj) {
    app.groupMgr.onGetGroupInfo(obj);
};
Router.prototype.ON_GROUP_CREATE_RS = function(obj) {
    app.groupMgr.onCreateGroup(obj);
};
Router.prototype.ON_GROUP_MODIFY_RS = function(obj) {
    app.groupMgr.onModifyGroup(obj);
};
Router.prototype.ON_GROUP_DELETE_RS = function(obj) {
    app.groupMgr.onRemoveGroup(obj);
};
Router.prototype.ON_GROUP_DELETE_NF = function(obj) {
    app.groupMgr.onRemoveGroupNotify(obj);
};
Router.prototype.ON_GROUP_JOIN_RS = function(obj) {
    app.groupMgr.onJoinGroup(obj);
};
Router.prototype.ON_GROUP_JOIN_NF = function(obj) {
    app.groupMgr.onJoinGroupNotify(obj);
};
Router.prototype.ON_GROUP_LEAVE_RS = function(obj) {
    app.groupMgr.onLeaveGroup(obj);
};
Router.prototype.ON_GROUP_LEAVE_NF = function(obj) {
    app.groupMgr.onLeaveGroupNotify(obj);
};
Router.prototype.ON_GROUP_PULL_IN_RS = function(obj) {
    app.groupMgr.onPullInGroup(obj);
};
Router.prototype.ON_GROUP_PULL_IN_NF = function(obj) {
    app.groupMgr.onPullInGroupNotify(obj);
};
Router.prototype.ON_GROUP_FIRE_OUT_RS = function(obj) {
    app.groupMgr.onFireOutGroup(obj);
};
Router.prototype.ON_GROUP_FIRE_OUT_NF = function(obj) {
    app.groupMgr.onFireOutGroupNotify(obj);
};

module.exports = new Router();
