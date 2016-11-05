'use strict';
var ReactNative = require('react-native');
var {
    AsyncStorage,
} = ReactNative;
var EventEmitter = require('EventEmitter');

const ITEM_NAME = "LOGIN_HISTORY_LIST";

class Manager extends EventEmitter {
    constructor() {
        super();
        this.list = [];
        this.get();
    }
    get() {
        return new Promise(async(resolve, reject)=>{
            var list = [];
            try {
                var infoStr = await AsyncStorage.getItem(ITEM_NAME);
                list = JSON.parse(infoStr);
            } catch(e) {
            }
            this.list = list||[];
        });
    }
    set(list) {
        return new Promise(async(resolve, reject)=>{
            this.list = list;
            await AsyncStorage.setItem(ITEM_NAME, JSON.stringify(list));
            resolve();
        });
    }
    savePhone(phone) {
        var list = this.list;
        if (_.includes(list, phone)) {
            list = _.without(list, phone);
        }
        list.unshift(phone);
        this.set(list);
    }
    clear() {
        this.list = [];
        AsyncStorage.removeItem(ITEM_NAME);
    },
    login(userid, password, autoLogin, remeberPassword) {
        if (!app.chatconnect) {
            Toast('服务器未连接');
            return;
        }
        var reconnect = !userid;
        if (!reconnect) {
            this.userid = userid;
            this.password = password;
            this.autoLogin = autoLogin;
            this.remeberPassword = remeberPassword;
        } else {
            userid = this.userid;
            password = this.password;
        }
        if (!userid || !password) {
            console.log("reconnect without user");
            return;
        }
        var param = {
            userid: userid,
            password: password,
            reconnect: reconnect
        };
        this.reconnect = reconnect;
        app.showWait();
        app.socket.emit('USER_LOGIN_RQ', param);
    }
    autoLogin(userid, password, autoLogin, remeberPassword) {
        this.login(userid, password, autoLogin, remeberPassword);
    }
    onLogin(obj) {
        console.log(obj);
        // app.hideWait();
        // if (obj.error) {
        //     app.showChatError(obj.error);
        //     return;
        // }
        // if (!this.reconnect) {
        //     var us = app.us;
        //     var constants = app.constants;
        //     var userid = obj.userid;
        //     us.string(constants.LOGIN_USER_ID, userid);
        //     if (this.remeberPassword) {
        //         us.string(constants.LOGIN_PASSWORD, obj.password);
        //     } else {
        //         us.string(constants.LOGIN_PASSWORD, '');
        //     }
        //     us.bool(constants.LOGIN_AUTO_LOGIN, this.autoLogin);
        //     var option = {
        //         indexes: [{name:"time", unique:false}]
        //         ,capped: {name:"time", max:1000, direction:1, strict:true}
        //     };
        //     app.db_history_message = indexed('history_message_'+userid).create(option);
        //     app.db_newest_message = indexed('newest_message_'+userid).create();
        //     app.db_user_head = indexed('user_head_'+userid).create();
        //     app.db_user_head.find(function (err, docs) {
        //         _.each(docs, function (doc) {
        //             $.insertStyleSheet(app.userHeadCss, '.user_head_' + doc.userid, 'background-image:url(' + doc.head + ')');
        //         });
        //     });
        // }
        // app.socket.emit('USER_LOGIN_SUCCESS_NFS');
        // this.online = true;
        // app.messageMgr.getNewestMessage();
        // app.showView('home', 'fade', null, true);
    }
    onRegister(obj) {
        console.log(obj);
        if (obj.error) {
            app.showChatError(obj.error);
            return;
        }
        ("Register Success");
        app.goBack();
    }
    onRegisterNotify(obj) {
        console.log(obj);
        app.userMgr.add({userid:obj.userid, username: obj.username, sign:obj.sign});
        app.notifyMgr.updateUserHead({userid:obj.userid, head:obj.head});
        app.userMgr.emitChange();
    }
}

module.exports = new Manager();
