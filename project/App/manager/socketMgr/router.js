module.exports = (function() {
    "use strict";

    function Router() {
    }

    Router.prototype.ON_CONNECT = function(obj) {
        app.chatconnect = true;
    };
    Router.prototype.ON_RECONNECT = function(obj) {
        app.chatconnect = true;
        app.mgr.login.login();
        ('服务器重新连接连接成功');
    };
    Router.prototype.ON_DISCONNECT = function(obj) {
        app.chatconnect = false;
        app.mgr.login.online = false;
        app.userMgr.reset();
        app.groupMgr.reset();
        ('服务器断开了连接');
    };
    Router.prototype.ON_USER_REGISTER_RS = function(obj) {
        app.mgr.login.onRegister(obj);
    };
    Router.prototype.ON_USER_REGISTER_NF = function(obj) {
        app.mgr.login.onRegisterNotify(obj);
    };
    Router.prototype.ON_USER_LOGIN_RS = function(obj) {
        app.mgr.login.onLogin(obj);
    };
    Router.prototype.ON_USER_LOGIN_NF = function(obj) {
        if (app.mgr.login.online) {
            app.userMgr.online(obj);
        }
    };
    Router.prototype.ON_USER_LOGOUT_NF = function(obj) {
        if (app.mgr.login.online) {
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
        app.emit('USER_MESSAGE_NFS', {from:obj.from,msgid:obj.msgid});
        app.messageMgr.showUserMessage(obj);
    };
    Router.prototype.ON_USER_MESSAGE_RECEIVED_NF = function(obj) {
        app.messageMgr.onUserMessageReceived(obj);
    };
    Router.prototype.ON_USER_OFFONLINE_MESSAGE_NF = function(obj) {
        app.emit('USER_OFFONLINE_MESSAGE_NFS');
        app.messageMgr.showOfflineMessage(obj);
    };
    Router.prototype.ON_USER_GET_MESSAGE_RS = function(obj) {
        app.messageMgr.onGetMessage(obj);
    };
    Router.prototype.ON_USERS_UPDATE_HEAD_RS = function(obj) {
        app.personalInfo.onUpdateHead();
    };
    Router.prototype.ON_USERS_UPDATE_HEAD_NF = function(obj) {
        app.notifyMgr.updateUserHead(obj);
    };
    Router.prototype.ON_USERS_GET_HEAD_RS = function(obj) {
        app.notifyMgr.onGetUserHead(obj);
    };
    Router.prototype.ON_USERS_UPDATE_USERINFO_RS = function(obj) {
        app.personalInfo.onUpdateUserInfo(obj);
    };
    Router.prototype.ON_USERS_UPDATE_USERINFO_NF = function(obj) {
        app.userMgr.onUpdateUserInfoNotify(obj);
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
    Router.prototype.ON_CALL_WEBRTC_SIGNAL_NF = function(obj) {
        app.callMgr.onCallWebrtcSignalNotify(obj);
    };
    Router.prototype.ON_CALL_OUT_RS = function(obj) {
        app.callMgr.onCallOut(obj);
    };
    Router.prototype.ON_CALL_IN_NF = function(obj) {
        app.callMgr.onCallInNotify(obj);
    };
    Router.prototype.ON_CALL_IN_REPLY_NF = function(obj) {
        app.callMgr.onCallInReplyNotify(obj);
    };
    Router.prototype.ON_CALL_HANGUP_RS = function(obj) {
        app.callMgr.onCallHangup(obj);
    };
    Router.prototype.ON_CALL_HANGUP_NF = function(obj) {
        app.callMgr.onCallHangupNotify(obj);
    };

    return new Router();
})();
