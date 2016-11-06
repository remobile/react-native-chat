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
        this.history = [];
        this.get();
    }
    get() {
        return new Promise(async(resolve, reject)=>{
            var history = [];
            try {
                var infoStr = await AsyncStorage.getItem(ITEM_NAME);
                history = JSON.parse(infoStr);
            } catch(e) {
            }
            this.history = history||[];

        });
    }
    set(history) {
        return new Promise(async(resolve, reject)=>{
            this.history = history;
            await AsyncStorage.setItem(ITEM_NAME, JSON.stringify(history));
            resolve();
        });
    }
    saveHistory(obj) {
        const {userid, password} = obj;
        var history = this.history;
        history = _.reject(history, (o)=>o.userid===obj.userid);
        history.unshift({userid, password:this.remeberPassword?password:'', autoLogin:this.autoLogin});
        this.set(history);
    }
    clear() {
        this.history = [];
        AsyncStorage.removeItem(ITEM_NAME);
    }
    login(params, callback) {
        const {userid, password, autoLogin, remeberPassword} = params;
        if (!app.chatconnect) {
            Toast('服务器未连接');
            callback && callback();
            return;
        }
        this.reconnect = !params;
        if (!this.reconnect) {
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
        };
        app.showWait();
        app.socket.emit('USER_LOGIN_RQ', param);
    }
    onLogin(obj) {
        console.log(obj);
        app.hideWait();
        if (obj.error) {
            app.showError(obj.error);
            return;
        }
        if (!this.reconnect) {
            this.saveHistory(obj);
        }
        app.socket.emit('USER_LOGIN_SUCCESS_NFS');
        this.online = true;
        // app.messageMgr.getNewestMessage();
        app.navigator.replace({
            component: require('../modules/home/index.js'),
        });
    }
    onRegister(obj) {
        console.log(obj);
        if (obj.error) {
            app.showError(obj.error);
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
