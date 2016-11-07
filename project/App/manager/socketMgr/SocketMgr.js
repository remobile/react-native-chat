'use strict';
var ReactNative = require('react-native');
var {
    AsyncStorage,
} = ReactNative;
var io = require('socket.io-client/socket.io');

class Manager {
    register() {
        const {loginMgr, userMgr, groupMgr, messageMgr, personalInfo, callMgr} = app;
        this.socket = io.connect('ws://127.0.0.1:8888', {
            connect_timeout: 3000,
            transports: ['websocket'],
        });
        this.socket._on = (type, callback) => {
            return this.socket.on(type, (obj) =>{
                console.log('recv:', type, obj);
                callback(obj);
            });
        };

        this.socket._on('connect', (obj) => {
            app.chatconnect = true;
        })._on('disconnect', (obj) => {
            app.chatconnect = false;
            loginMgr.online = false;
            userMgr.reset();
            groupMgr.reset();
            Toast('服务器断开了连接');
        })._on('connect_error', (obj) => {
        })._on('connect_timeout', (obj) => {
        })._on('reconnect', (obj) => {
            app.chatconnect = true;
            loginMgr.login();
            Toast('服务器重新连接连接成功');
        })._on('reconnect_error', (obj) => {
        })._on('reconnect_failed', (obj) => {
        })._on('USER_REGISTER_RS', (obj) => {
            loginMgr.onRegister(obj);
        })._on('USER_REGISTER_NF', (obj) => {
            loginMgr.onRegisterNotify(obj);
        })._on('USER_LOGIN_RS', (obj) => {
            loginMgr.onLogin(obj);
        })._on('USER_LOGOUT_NF', (obj) => {
            if (loginMgr.online) {
                userMgr.offline(obj);
            }
        })._on('USER_LOGIN_NF', (obj) => {
            if (loginMgr.online) {
                userMgr.online(obj);
            }
        })._on('USERS_LIST_NF', (obj) => {
            userMgr.addList(obj);
        })._on('GROUP_LIST_NF', (obj) => {
            // groupMgr.addList(obj);
        })._on('USERS_NOTIFY_NF', (obj) => {
            notifyMgr.onNotify(obj);
        })._on('USER_SEND_MESSAGE_RS', (obj) => {
            messageMgr.onSendUserMessage(obj);
        })._on('USER_MESSAGE_NF', (obj) => {
            this.emit('USER_MESSAGE_NFS', {from:obj.from, msgid:obj.msgid});
            messageMgr.showUserMessage(obj);
        })._on('USER_MESSAGE_RECEIVED_NF', (obj) => {
            messageMgr.onUserMessageReceived(obj);
        }).once('USER_OFFONLINE_MESSAGE_NF', (obj) => {
            this.emit('USER_OFFONLINE_MESSAGE_NFS');
            messageMgr.showOfflineMessage(obj);
        })._on('USER_GET_MESSAGE_RS', (obj) => {
            messageMgr.onGetMessage(obj);
        })._on('USERS_UPDATE_HEAD_RS', (obj) => {
            personalInfo.onUpdateHead();
        })._on('USERS_UPDATE_HEAD_NF', (obj) => {
            notifyMgr.updateUserHead(obj);
        })._on('USERS_GET_HEAD_RS', (obj) => {
            notifyMgr.onGetUserHead(obj);
        })._on('USERS_UPDATE_USERINFO_RS', (obj) => {
            personalInfo.onUpdateUserInfo(obj);
        })._on('USERS_UPDATE_USERINFO_NF', (obj) => {
            userMgr.onUpdateUserInfoNotify(obj);
        })._on('GROUP_LIST_RS', (obj) => {
            groupMgr.onGetGroupList(obj);
        })._on('GROUP_INFO_RS', (obj) => {
            groupMgr.onGetGroupInfo(obj);
        })._on('GROUP_CREATE_RS', (obj) => {
            groupMgr.onCreateGroup(obj);
        })._on('GROUP_MODIFY_RS', (obj) => {
            groupMgr.onModifyGroup(obj);
        })._on('GROUP_DELETE_RS', (obj) => {
            groupMgr.onRemoveGroup(obj);
        })._on('GROUP_DELETE_NF', (obj) => {
            groupMgr.onRemoveGroupNotify(obj);
        })._on('GROUP_JOIN_RS', (obj) => {
            groupMgr.onJoinGroup(obj);
        })._on('GROUP_JOIN_NF', (obj) => {
            groupMgr.onJoinGroupNotify(obj);
        })._on('GROUP_LEAVE_RS', (obj) => {
            groupMgr.onLeaveGroup(obj);
        })._on('GROUP_LEAVE_NF', (obj) => {
            groupMgr.onLeaveGroupNotify(obj);
        })._on('GROUP_PULL_IN_RS', (obj) => {
            groupMgr.onPullInGroup(obj);
        })._on('GROUP_PULL_IN_NF', (obj) => {
            groupMgr.onPullInGroupNotify(obj);
        })._on('GROUP_FIRE_OUT_RS', (obj) => {
            groupMgr.onFireOutGroup(obj);
        })._on('GROUP_FIRE_OUT_NF', (obj) => {
            groupMgr.onFireOutGroupNotify(obj);
        })._on('CALL_WEBRTC_SIGNAL_NF', (obj) => {
            callMgr.onCallWebrtcSignalNotify(obj);
        })._on('CALL_OUT_RS', (obj) => {
            callMgr.onCallOut(obj);
        })._on('CALL_IN_NF', (obj) => {
            callMgr.onCallInNotify(obj);
        })._on('CALL_IN_REPLY_NF', (obj) => {
            callMgr.onCallInReplyNotify(obj);
        })._on('CALL_HANGUP_RS', (obj) => {
            callMgr.onCallHangup(obj);
        })._on('CALL_HANGUP_NF', (obj) => {
            callMgr.onCallHangupNotify(obj);
        });
    }
    emit(type, data, notNeedCheckOnline) {
        console.log('send:', type, data);
        if (!notNeedCheckOnline && !app.loginMgr.online) {
            console.log('you are offline');
            return;
        }
        this.socket.emit(type, data);
    }
}

module.exports = new Manager();
