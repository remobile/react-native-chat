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
    reset() {
        this.users = {};
        this.groupedUsers = {}; //use alpha grouped
        this.init = false;
    }
    emitChange() {
        this.emit('USER_LIST_CHANGE');
    }
    add(obj) {
        var users = this.users;
        var userid = obj.userid;
        if(!users.hasOwnProperty(userid)) {
            users[userid] = obj;
            this.addGroupedUser(userid);
            this.emitChange();
        }
    }
    remove(obj) {
        var users = this.users;
        var userid = obj.userid;
        if(users.hasOwnProperty(userid)) {
            var username = users[userid].username;
            delete users[userid];
            this.removeGroupedUser(userid, username);
            this.emitChange();
        }
    }
    online(obj) {
        var userid = obj.userid;
        this.users[userid].online = true;
        this.emitChange();
    }
    offline(obj) {
        var userid = obj.userid;
        this.users[userid].online = false;
        this.emitChange();
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
        this.emitChange();
        this.init = true;
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
    updateHead(head) {
        app.socketMgr.emit('USERS_UPDATE_HEAD_RQ', {head});
    }
    updateUserInfo(username, phone, sign) {
        app.socketMgr.emit('USERS_UPDATE_USERINFO_RQ', {username, phone, sign});
    }
    onUpdateUserInfoNotify(obj) {
        var users = this.users;
        var userid = obj.userid;
        if(users.hasOwnProperty(userid)) {
            users[userid].username = obj.username;
            users[userid].phone = obj.phone;
            users[userid].sign = obj.sign;
            this.emitChange();
        }
    }
}
