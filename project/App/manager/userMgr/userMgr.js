var _  = require('underscore');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

module.exports = (function() {
    "use strict";
    function UserMgr() {
        assign(this, EventEmitter.prototype);
        this.reset();
    }

    UserMgr.prototype.emitChange = function() {
        this.emit("change");
    };
    UserMgr.prototype.addChangeListener = function(callback) {
        this.on("change", callback);
    };
    UserMgr.prototype.removeChangeListener = function(callback) {
        this.removeListener("change", callback);
    };
    UserMgr.prototype.reset = function() {
        this.users = {};
        this.groupedUsers = {}; //use alpha grouped
        this.init = false;
    };
    UserMgr.prototype.add = function(obj) {
        var users = this.users;
        var userid = obj.userid;
        if(!users.hasOwnProperty(userid)) {
            users[userid] = obj;
            this.addGroupedUser(userid);
            this.emitChange();
        }
    };
    UserMgr.prototype.remove = function(obj) {
        var users = this.users;
        var userid = obj.userid;
        if(users.hasOwnProperty(userid)) {
            var username = users[userid].username;
            delete users[userid];
            this.removeGroupedUser(userid, username);
            this.emitChange();
        }
    };
    UserMgr.prototype.online = function(obj) {
        var userid = obj.userid;
        this.users[userid].online = true;
        this.emitChange();
        console.log("red@"+userid, "login");
    };
    UserMgr.prototype.offline = function(obj) {
        var userid = obj.userid;
        this.users[userid].online = false;
        this.emitChange();
        console.log("red@"+userid, "logout");
    };
    UserMgr.prototype.addList = function(list) {
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
    };
    UserMgr.prototype.addGroupedUser = function(userid) {
        if (app.loginMgr.userid === userid) {
            return;
        }
        var user = this.users[userid];
        var username = user.username;
        var alpha = $.fisrtPinyin(username);
        var list = this.groupedUsers;
        if (!list[alpha]) {
            list[alpha] = [];
        }
        list[alpha].push(userid);
    };
    UserMgr.prototype.removeGroupedUser = function(userid, username) {
        var alpha = $.fisrtPinyin(username);
        var list = this.groupedUsers[alpha];
        if (list) {
            list = _.without(list, userid);
            if (list.length === 0) {
                delete this.groupedUsers[alpha];
            } else {
                this.groupedUsers[alpha] = list;
            }
        }
    };
    UserMgr.prototype.getUseridByUsername = function(username) {
        var users = this.users;
        for (var id in users) {
            var user = users[id];
            if (username == user.username) {
                return id;
            }
        }
        return null;
    };
    UserMgr.prototype.updateHead = function(head) {
        app.emit('USERS_UPDATE_HEAD_RQ', {head:head});
    };
    UserMgr.prototype.updateUserInfo = function(username, phone, sign) {
        app.emit('USERS_UPDATE_USERINFO_RQ', {username:username, phone:phone, sign:sign});
    };
    UserMgr.prototype.onUpdateUserInfoNotify = function(obj) {
        console.log(obj);
        var users = this.users;
        var userid = obj.userid;
        if(users.hasOwnProperty(userid)) {
            users[userid].username = obj.username;
            users[userid].phone = obj.phone;
            users[userid].sign = obj.sign;
            this.emitChange();
        }
    };

    return new UserMgr();
})();


