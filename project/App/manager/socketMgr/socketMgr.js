'use strict';
var ReactNative = require('react-native');
var {
    AsyncStorage,
} = ReactNative;

var io = require('socket.io-client/socket.io');

class Manager {
    register() {
        const {loginMgr} = app;
        app.socket = io.connect('ws://127.0.0.1:8888', {
            connect_timeout: 3000,
            transports: ['websocket'],
        });
        app.socket.on('connect', function(obj) {
            console.log("connect to server");
            app.chatconnect = true;
        }).on('disconnect', function(obj) {
            console.log("disconnect to server");
            app.chatconnect = false;
            loginMgr.online = false;
            // app.userMgr.reset();
            // app.groupMgr.reset();
            Toast('服务器断开了连接');
        }).on('connect_error', function(obj) {
            console.log("connect to server error");
        }).on('connect_timeout', function(obj) {
            console.log("connect to server timeout");
        }).on('reconnect', function(obj) {
            console.log(" reconnect to server");
            app.chatconnect = true;
            loginMgr.login();
            Toast('服务器重新连接连接成功');
        }).on('reconnect_error', function(obj) {
            console.log("reconnect to server error");
        }).on('reconnect_failed', function(obj) {
            console.log("reconnect to server failed");
        }).on('USER_REGISTER_RS', function(obj) {
            loginMgr.onRegister(obj);
        }).on('USER_REGISTER_NF', function(obj) {
            loginMgr.onRegisterNotify(obj);
        }).on('USER_LOGIN_RS', function(obj) {
            loginMgr.onLogin(obj);
        })
    }
    send() {

    }
}

module.exports = new Manager();


//
// module.exports = (function() {
//     "use strict";
//     var router = require('./router');
//     function SocketMgr() {
//     }
//     SocketMgr.prototype.start = function(url) {
//         app.socket = io.connect(url, {
//             connect_timeout: 3000
//         });
// app.socket.on('connect', function(obj) {
//     console.log("connect to server");
//     router.ON_CONNECT();
// }).on('disconnect', function(obj) {
//     console.log("disconnect to server");
//     router.ON_DISCONNECT();
// }).on('connect_error', function(obj) {
//     console.log("connect to server error");
//     //app.showError(app.error.CANNOT_CONNECT_CHAT_SERVER);
// }).on('connect_timeout', function(obj) {
//     console.log("connect to server timeout");
// }).on('reconnect', function(obj) {
//     console.log(" reconnect to server");
//     router.ON_RECONNECT();
// }).on('reconnect_error', function(obj) {
//     console.log("reconnect to server error");
//     //app.showError(app.error.CANNOT_CONNECT_CHAT_SERVER);
// }).on('reconnect_failed', function(obj) {
//     console.log("reconnect to server failed");
//     //app.showError(app.error.CANNOT_CONNECT_CHAT_SERVER);
// }).on('USER_REGISTER_RS', function(obj) {
//     app.router.ON_USER_REGISTER_RS(obj);
// }).on('USER_REGISTER_NF', function(obj) {
//     app.router.ON_USER_REGISTER_NF(obj);
// }).on('USER_LOGIN_RS', function(obj) {
//     router.ON_USER_LOGIN_RS(obj);
// }).on('USER_LOGOUT_NF', function(obj) {
//             router.ON_USER_LOGOUT_NF(obj);
//         }).on('USER_LOGIN_NF', function(obj) {
//             router.ON_USER_LOGIN_NF(obj);
//         }).on('USERS_LIST_NF', function(obj) {
//             router.ON_USERS_LIST_NF(obj);
//         }).on('GROUP_LIST_NF', function(obj) {
//             router.ON_GROUP_LIST_NF(obj);
//         }).on('USERS_NOTIFY_NF', function(obj) {
//             router.ON_USERS_NOTIFY_NF(obj);
//         }).on('USER_SEND_MESSAGE_RS', function(obj) {
//             router.ON_USER_SEND_MESSAGE_RS(obj);
//         }).on('USER_MESSAGE_NF', function(obj) {
//             router.ON_USER_MESSAGE_NF(obj);
//         }).on('USER_MESSAGE_RECEIVED_NF', function(obj) {
//             router.ON_USER_MESSAGE_RECEIVED_NF(obj);
//         }).once('USER_OFFONLINE_MESSAGE_NF', function(obj) {
//             router.ON_USER_OFFONLINE_MESSAGE_NF(obj);
//         }).on('USER_GET_MESSAGE_RS', function(obj) {
//             router.ON_USER_GET_MESSAGE_RS(obj);
//         }).on('USERS_UPDATE_HEAD_RS', function(obj) {
//             router.ON_USERS_UPDATE_HEAD_RS(obj);
//         }).on('USERS_UPDATE_HEAD_NF', function(obj) {
//             router.ON_USERS_UPDATE_HEAD_NF(obj);
//         }).on('USERS_GET_HEAD_RS', function(obj) {
//             router.ON_USERS_GET_HEAD_RS(obj);
//         }).on('USERS_UPDATE_USERINFO_RS', function(obj) {
//             router.ON_USERS_UPDATE_USERINFO_RS(obj);
//         }).on('USERS_UPDATE_USERINFO_NF', function(obj) {
//             router.ON_USERS_UPDATE_USERINFO_NF(obj);
//         }).on('GROUP_LIST_RS', function(obj) {
//             router.ON_GROUP_LIST_RS(obj);
//         }).on('GROUP_INFO_RS', function(obj) {
//             router.ON_GROUP_INFO_RS(obj);
//         }).on('GROUP_CREATE_RS', function(obj) {
//             router.ON_GROUP_CREATE_RS(obj);
//         }).on('GROUP_MODIFY_RS', function(obj) {
//             router.ON_GROUP_MODIFY_RS(obj);
//         }).on('GROUP_DELETE_RS', function(obj) {
//             router.ON_GROUP_DELETE_RS(obj);
//         }).on('GROUP_DELETE_NF', function(obj) {
//             router.ON_GROUP_DELETE_NF(obj);
//         }).on('GROUP_JOIN_RS', function(obj) {
//             router.ON_GROUP_JOIN_RS(obj);
//         }).on('GROUP_JOIN_NF', function(obj) {
//             router.ON_GROUP_JOIN_NF(obj);
//         }).on('GROUP_LEAVE_RS', function(obj) {
//             router.ON_GROUP_LEAVE_RS(obj);
//         }).on('GROUP_LEAVE_NF', function(obj) {
//             router.ON_GROUP_LEAVE_NF(obj);
//         }).on('GROUP_PULL_IN_RS', function(obj) {
//             router.ON_GROUP_PULL_IN_RS(obj);
//         }).on('GROUP_PULL_IN_NF', function(obj) {
//             router.ON_GROUP_PULL_IN_NF(obj);
//         }).on('GROUP_FIRE_OUT_RS', function(obj) {
//             router.ON_GROUP_FIRE_OUT_RS(obj);
//         }).on('GROUP_FIRE_OUT_NF', function(obj) {
//             router.ON_GROUP_FIRE_OUT_NF(obj);
//         }).on('CALL_WEBRTC_SIGNAL_NF', function(obj) {
//             router.ON_CALL_WEBRTC_SIGNAL_NF(obj);
//         }).on('CALL_OUT_RS', function(obj) {
//             router.ON_CALL_OUT_RS(obj);
//         }).on('CALL_IN_NF', function(obj) {
//             router.ON_CALL_IN_NF(obj);
//         }).on('CALL_IN_REPLY_NF', function(obj) {
//             router.ON_CALL_IN_REPLY_NF(obj);
//         }).on('CALL_HANGUP_RS', function(obj) {
//             router.ON_CALL_HANGUP_RS(obj);
//         }).on('CALL_HANGUP_NF', function(obj) {
//             router.ON_CALL_HANGUP_NF(obj);
//         });
//     };
//     return new SocketMgr();
// })();
