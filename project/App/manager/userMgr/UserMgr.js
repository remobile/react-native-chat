'use strict';
var ReactNative = require('react-native');
var {
    AsyncStorage,
} = ReactNative;
var EventEmitter = require('EventEmitter');
var fisrtPinyin = require('../../utils/pinyin');

class Manager extends EventEmitter {
    constructor() {
        super();
        this.reset();
	}
    emitUserListChange() {
        this.emit('USER_LIST_CHANGE_EVENT');
    }
    addUserListChangeListener(target) {
        target.addListenerOn(this, "USER_LIST_CHANGE_EVENT", target.onUserListChangeListener);
    };
    emitUserHeadChange(userid) {
        this.emit('USER_HEAD_CHANGE_EVENT', userid);
    }
    addUserHeadChangeListener(target) {
        target.addListenerOn(this, "USER_HEAD_CHANGE_EVENT", target.onUserHeadChangeListener);
    };
    reset() {
        this.users = {};
        this.groupedUsers = {}; //use alpha grouped
        this._init = false;
    }
    add(obj) {
        var users = this.users;
        var userid = obj.userid;
        if(!users.hasOwnProperty(userid)) {
            users[userid] = obj;
            this.addGroupedUser(userid);
            this.emitUserListChange();
        }
    }
    remove(obj) {
        var users = this.users;
        var userid = obj.userid;
        if(users.hasOwnProperty(userid)) {
            var username = users[userid].username;
            delete users[userid];
            this.removeGroupedUser(userid, username);
            this.emitUserListChange();
        }
    }
    online(obj) {
        var userid = obj.userid;
        this.users[userid].online = true;
        this.emitUserListChange();
    }
    offline(obj) {
        var userid = obj.userid;
        this.users[userid].online = false;
        this.emitUserListChange();
    }
    addList(list) {
        var users = this.users;
        for (var i in list) {
            var userid =list[i].userid;
            if(!users.hasOwnProperty(userid)) {
                users[userid] = list[i];
                this.addGroupedUser(userid);
            }
        }
        this.emitUserListChange();
        this._init = true;
    }
    addGroupedUser(userid) {
        if (app.loginMgr.userid === userid) {
            return;
        }
        var user = this.users[userid];
        var username = user.username;
        var alpha = fisrtPinyin(username);
        var list = this.groupedUsers;
        if (!list[alpha]) {
            list[alpha] = [];
            this.groupedUsers = {};
            Object.keys(list).sort().forEach((o)=>{this.groupedUsers[o]=list[o]}); //按照字母排序
            list = this.groupedUsers;
        }
        list[alpha].push(userid);
    }
    removeGroupedUser(userid, username) {
        var alpha = fisrtPinyin(username);
        var list = this.groupedUsers[alpha];
        if (list) {
            list = _.without(list, userid);
            if (list.length === 0) {
                delete this.groupedUsers[alpha];
            } else {
                this.groupedUsers[alpha] = list;
            }
        }
    }
    getUseridByUsername(username) {
        var users = this.users;
        for (var id in users) {
            var user = users[id];
            if (username == user.username) {
                return id;
            }
        }
        return null;
    }
    onUserUpdateHead(obj) {
        const {userid, head} = obj;
        this.users[userid].head = head;
        this.emitUserListChange();
        this.emitUserHeadChange(userid);
    }
    updateUserInfo(username, phone, sign) {
        app.socketMgr.emit('USERS_UPDATE_USERINFO_RQ', {username, phone, sign});
    }
    onUpdateUserInfo(obj) {
        console.log("onUpdateUserInfo", obj);
    }
    onUpdateUserInfoNotify(obj) {
        var users = this.users;
        var userid = obj.userid;
        if(users.hasOwnProperty(userid)) {
            users[userid].username = obj.username;
            users[userid].phone = obj.phone;
            users[userid].sign = obj.sign;
            this.emitUserListChange();
        }
    }
}

module.exports = new Manager();
