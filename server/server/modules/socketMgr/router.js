module.exports = (function() {
    function Router() {
    }

    Router.prototype.ON_DISCONNECT = function(socket) {
		app.onlineUserMgr.remove(socket);
	};
    Router.prototype.ON_USER_LOGIN_RQ = function(socket, obj) {
		app.userMgr.login(socket, obj);
	};
    Router.prototype.ON_USER_LOGIN_SUCCESS_NFS = function(socket, obj) {
		app.userMgr.onLoginSuccess(socket, obj);
	};
    Router.prototype.ON_USER_REGISTER_RQ = function(socket, obj) {
		app.userMgr.register(socket, obj);
	};
    Router.prototype.ON_USER_SEND_MESSAGE_RQ = function(socket, obj) {
		app.messageMgr.send(socket, obj);
	};
    Router.prototype.ON_USER_MESSAGE_NFS = function(socket, obj) {
		app.messageMgr.onUserReceivedMessage(socket, obj);
	};
    Router.prototype.ON_USER_OFFONLINE_MESSAGE_NFS = function(socket) {
		app.messageMgr.deleteOfflineMessage(socket);
	};
    Router.prototype.ON_USER_GET_MESSAGE_RQ = function(socket, obj) {
		app.messageMgr.getHistoryMessage(socket, obj);
	};
    Router.prototype.ON_USERS_NOTIFY_NFS = function(socket) {
		app.notifyMgr.clearNotify(socket);
	};
    Router.prototype.ON_USERS_UPDATE_USERINFO_RQ = function(socket, obj) {
		app.userMgr.updateUserInfo(socket, obj);
	};
    Router.prototype.ON_GROUP_LIST_RQ = function(socket, obj) {
		app.groupMgr.getGroupList(socket, obj);
	};
    Router.prototype.ON_GROUP_INFO_RQ = function(socket, obj) {
		app.groupMgr.getGroupInfo(socket, obj);
	};
    Router.prototype.ON_GROUP_CREATE_RQ = function(socket, obj) {
		app.groupMgr.createGroup(socket, obj);
	};
    Router.prototype.ON_GROUP_MODIFY_RQ = function(socket, obj) {
		app.groupMgr.modifyGroup(socket, obj);
	};
    Router.prototype.ON_GROUP_DELETE_RQ = function(socket, obj) {
		app.groupMgr.removeGroup(socket, obj);
	};
    Router.prototype.ON_GROUP_JOIN_RQ = function(socket, obj) {
		app.groupMgr.joinGroup(socket, obj);
	};
    Router.prototype.ON_GROUP_LEAVE_RQ = function(socket, obj) {
		app.groupMgr.leaveGroup(socket, obj);
	};
    Router.prototype.ON_GROUP_PULL_IN_RQ = function(socket, obj) {
		app.groupMgr.pullInGroup(socket, obj);
	};
    Router.prototype.ON_GROUP_FIRE_OUT_RQ = function(socket, obj) {
		app.groupMgr.fireOutGroup(socket, obj);
	};
    Router.prototype.ON_CALL_WEBRTC_SIGNAL_NFS = function(socket, obj) {
		app.callMgr.callWebrtcSignal(socket, obj);
	};
    Router.prototype.ON_CALL_OUT_RQ = function(socket, obj) {
		app.callMgr.callOut(socket, obj);
	};
    Router.prototype.ON_CALL_HANGUP_RQ = function(socket, obj) {
		app.callMgr.callHangup(socket, obj);
	};
    Router.prototype.ON_CALL_IN_NFS = function(socket, obj) {
		app.callMgr.callInReply(socket, obj);
	};
    return new Router();
})();
