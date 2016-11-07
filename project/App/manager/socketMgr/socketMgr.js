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
        this.socket.on('connect', (obj)=> {
            console.log("connect to server");
            app.chatconnect = true;
        }).on('disconnect', (obj)=> {
            console.log("disconnect to server");
            app.chatconnect = false;
            loginMgr.online = false;
            userMgr.reset();
            groupMgr.reset();
            Toast('服务器断开了连接');
        }).on('connect_error', (obj)=> {
            console.log("connect to server error");
        }).on('connect_timeout', (obj)=> {
            console.log("connect to server timeout");
        }).on('reconnect', (obj)=> {
            console.log(" reconnect to server");
            app.chatconnect = true;
            loginMgr.login();
            Toast('服务器重新连接连接成功');
        }).on('reconnect_error', (obj)=> {
            console.log("reconnect to server error");
        }).on('reconnect_failed', (obj)=> {
            console.log("reconnect to server failed");
        }).on('USER_REGISTER_RS', (obj)=> {
            loginMgr.onRegister(obj);
        }).on('USER_REGISTER_NF', (obj)=> {
            loginMgr.onRegisterNotify(obj);
        }).on('USER_LOGIN_RS', (obj)=> {
            loginMgr.onLogin(obj);
        }).on('USER_LOGOUT_NF', (obj)=> {
            if (loginMgr.online) {
                userMgr.offline(obj);
            }
        }).on('USER_LOGIN_NF', (obj)=> {
            if (loginMgr.online) {
                userMgr.online(obj);
            }
        }).on('USERS_LIST_NF', (obj)=> {
            userMgr.addList(obj);
        }).on('GROUP_LIST_NF', (obj)=> {
            groupMgr.addList(obj);
        }).on('USERS_NOTIFY_NF', (obj)=> {
            notifyMgr.onNotify(obj);
        }).on('USER_SEND_MESSAGE_RS', (obj)=> {
            messageMgr.onSendUserMessage(obj);
        }).on('USER_MESSAGE_NF', (obj)=> {
            this.emit('USER_MESSAGE_NFS', {from:obj.from, msgid:obj.msgid});
            messageMgr.showUserMessage(obj);
        }).on('USER_MESSAGE_RECEIVED_NF', (obj)=> {
            messageMgr.onUserMessageReceived(obj);
        }).once('USER_OFFONLINE_MESSAGE_NF', (obj)=> {
            this.emit('USER_OFFONLINE_MESSAGE_NFS');
            messageMgr.showOfflineMessage(obj);
        }).on('USER_GET_MESSAGE_RS', (obj)=> {
            messageMgr.onGetMessage(obj);
        }).on('USERS_UPDATE_HEAD_RS', (obj)=> {
            personalInfo.onUpdateHead();
        }).on('USERS_UPDATE_HEAD_NF', (obj)=> {
            notifyMgr.updateUserHead(obj);
        }).on('USERS_GET_HEAD_RS', (obj)=> {
            notifyMgr.onGetUserHead(obj);
        }).on('USERS_UPDATE_USERINFO_RS', (obj)=> {
            personalInfo.onUpdateUserInfo(obj);
        }).on('USERS_UPDATE_USERINFO_NF', (obj)=> {
            userMgr.onUpdateUserInfoNotify(obj);
        }).on('GROUP_LIST_RS', (obj)=> {
            groupMgr.onGetGroupList(obj);
        }).on('GROUP_INFO_RS', (obj)=> {
            groupMgr.onGetGroupInfo(obj);
        }).on('GROUP_CREATE_RS', (obj)=> {
            groupMgr.onCreateGroup(obj);
        }).on('GROUP_MODIFY_RS', (obj)=> {
            groupMgr.onModifyGroup(obj);
        }).on('GROUP_DELETE_RS', (obj)=> {
            groupMgr.onRemoveGroup(obj);
        }).on('GROUP_DELETE_NF', (obj)=> {
            groupMgr.onRemoveGroupNotify(obj);
        }).on('GROUP_JOIN_RS', (obj)=> {
            groupMgr.onJoinGroup(obj);
        }).on('GROUP_JOIN_NF', (obj)=> {
            groupMgr.onJoinGroupNotify(obj);
        }).on('GROUP_LEAVE_RS', (obj)=> {
            groupMgr.onLeaveGroup(obj);
        }).on('GROUP_LEAVE_NF', (obj)=> {
            groupMgr.onLeaveGroupNotify(obj);
        }).on('GROUP_PULL_IN_RS', (obj)=> {
            groupMgr.onPullInGroup(obj);
        }).on('GROUP_PULL_IN_NF', (obj)=> {
            groupMgr.onPullInGroupNotify(obj);
        }).on('GROUP_FIRE_OUT_RS', (obj)=> {
            groupMgr.onFireOutGroup(obj);
        }).on('GROUP_FIRE_OUT_NF', (obj)=> {
            groupMgr.onFireOutGroupNotify(obj);
        }).on('CALL_WEBRTC_SIGNAL_NF', (obj)=> {
            callMgr.onCallWebrtcSignalNotify(obj);
        }).on('CALL_OUT_RS', (obj)=> {
            callMgr.onCallOut(obj);
        }).on('CALL_IN_NF', (obj)=> {
            callMgr.onCallInNotify(obj);
        }).on('CALL_IN_REPLY_NF', (obj)=> {
            callMgr.onCallInReplyNotify(obj);
        }).on('CALL_HANGUP_RS', (obj)=> {
            callMgr.onCallHangup(obj);
        }).on('CALL_HANGUP_NF', (obj)=> {
            callMgr.onCallHangupNotify(obj);
        });
    }
    emit(type, data, notNeedCheckOnline) {
        console.log(type, data);
        if (!notNeedCheckOnline && !app.loginMgr.online) {
            console.log('you are offline');
            return;
        }
        this.socket.emit(type, data);
    }
}

module.exports = new Manager();
