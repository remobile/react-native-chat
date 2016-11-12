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
    emitRegisterEvent(obj) {
        this.emit('REGISTER_EVENT', obj);
    }
    addRegisterEventListener(target) {
        target.addListenerOn(this, "REGISTER_EVENT", target.onRegisterEventListener);
    };
    emitLoginEvent(obj) {
        this.emit('LOGIN_EVENT', obj);
    }
    addLoginEventListener(target) {
        target.addListenerOn(this, "LOGIN_EVENT", target.onLoginEventListener);
    };
    get() {
        return new Promise(async(resolve, reject)=>{
            var history = [];
            try {
                var infoStr = await AsyncStorage.getItem(ITEM_NAME);
                history = JSON.parse(infoStr);
            } catch(e) {
            }
            this.history = history||[];
            var {userid, password, autoLogin, remeberPassword} = _.first(this.history)||{};
            this.userid = userid;
            this.password = password;
            this.autoLogin = autoLogin;
            this.remeberPassword = !!password;
        });
    }
    set(history) {
        return new Promise(async(resolve, reject)=>{
            this.history = history;
            await AsyncStorage.setItem(ITEM_NAME, JSON.stringify(history));
            resolve();
        });
    }
    saveHistory() {
        const {userid, password} = this;
        var history = this.history;
        history = _.reject(history, (o)=>o.userid===userid);
        history.unshift({userid, password:this.remeberPassword?password:'', autoLogin:this.autoLogin});
        this.set(history);
    }
    clear() {
        this.history = [];
        AsyncStorage.removeItem(ITEM_NAME);
    }
    login(params) {
        let {userid, password, autoLogin, remeberPassword} = params||{};
        if (!app.chatconnect) {
            Toast('服务器未连接');
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
            userid,
            password,
        };
        app.showWait();
        app.socketMgr.emit('USER_LOGIN_RQ', param, true);
    }
    onLogin(obj) {
        app.hideWait();
        if (obj.error) {
            this.reconnect = false;
            app.showError(obj.error);
            this.emitLoginEvent(obj);
            return;
        }
        if (!this.reconnect) {
            console.log("=================123");
            this.saveHistory();
        }
        this.online = true;
        this.sign = obj.sign;
        this.username = obj.username;
        app.socketMgr.emit('USER_LOGIN_SUCCESS_NFS');
        app.messageMgr.initMessageDatabase(this.userid);
        this.emitLoginEvent(obj);
    }
    register(obj) {
        app.socketMgr.emit('USER_REGISTER_RQ', obj, true);
    }
    onRegister(obj) {
        this.emitRegisterEvent(obj);
    }
    onRegisterNotify(obj) {
        console.log(obj);
        app.userMgr.add({userid:obj.userid, username: obj.username, sign:obj.sign});
        app.notifyMgr.updateUserHead({userid:obj.userid, head:obj.head});
        app.userMgr.emitChange();
    }
}

module.exports = new Manager();
