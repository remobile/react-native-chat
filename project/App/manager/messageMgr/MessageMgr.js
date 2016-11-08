'use strict';
var ReactNative = require('react-native');
var {
    AsyncStorage,
} = ReactNative;
var EventEmitter = require('EventEmitter');

const
MESSAGE_BADGES = 'MESSAGE_BADGES',
GROUP_MESSAGE_BADGES = 'GROUP_MESSAGE_BADGES',
GROUP_CHAT_AT_NUMBERS = 'GROUP_CHAT_AT_NUMBERS';

const ITEM_NAME = "MESSAGE_MANAGER";

class Manager extends EventEmitter {
    constructor() {
        //message type
        this.TEXT_TYPE = 0;
        this.IMAGE_TYPE = 1;
        this.AUDIO_TYPE = 2;
        this.VIDEO_TYPE = 3;

        //user type
        this.USER_TYPE = 0;
        this.GROUP_TYPE = 1;

        //message per count
        this.PER_COUNT = 10;

        this.newestMessage = [];
        this.displayMessage = [];
        this.displayMessageInfo = {};
        this.get();
        this.getUnreadMessage();
    }
    get() {
        return new Promise(async(resolve, reject)=>{
            var data = {msgid: 1};
            try {
                var infoStr = await AsyncStorage.getItem(ITEM_NAME);
                data = JSON.parse(infoStr);
            } catch(e) {
                data = {msgid: 1};
            }
            this.data = data;
        });
    }
    set(data) {
        return new Promise(async(resolve, reject)=>{
            this.data = data;
            await AsyncStorage.setItem(ITEM_NAME, JSON.stringify(data));
            resolve();
        });
    }
    setUserID(userid) {
        this.userid = userid;
        this.NEWEST_MESSAGE_COLLECTION = 'NEWEST_MESSAGE_COLLECTION_'+userid;
        this.NEWEST_MESSAGE_COLLECTION = 'NEWEST_MESSAGE_COLLECTION_'+userid;
    }
    getUnreadMessage() {
        // this.unreadMessage = {
        //     group: us.object(GROUP_MESSAGE_BADGES)||{},
        //     users: us.object(MESSAGE_BADGES)||{},
        //     at: us.object(GROUP_CHAT_AT_NUMBERS)||{}
        // };
        this.unreadMessage = {
            group: {},
            users: {},
            at: {}
        };
        var obj = this.unreadMessage.group;
        var total = 0;
        for (var key in obj) {
           total += obj[key];
        }
        var obj = this.unreadMessage.users;
        for (var key in obj) {
           total += obj[key];
        }
        this.unreadMessage.total = total;
    }
    emitNewestMessageChange() {
        this.emit("NEWEST_MESSAGE_CHANGE_EVENT");
    }
    addNewestMessageChangeListener(target) {
        target.addListenerOn(this, "NEWEST_MESSAGE_CHANGE_EVENT", target.onNewestMessageChangeListener);
    }
    emitDisplayMessageChange() {
        this.emit("DISPLAY_MESSAGE_CHANGE_EVENT");
    }
    addDisplayMessageChangeListener(callback) {
        target.addListenerOn(this, "DISPLAY_MESSAGE_CHANGE_EVENT", target.onDisplayMessageChangeListener);
    }
    increaseMsgId() {
        this.data.msgid++;
        if (!this.data.msgid) {
            this.data.msgid = 1;
        }
        this.set(this.data);
    }
    getNewestMessage() {
        var self = this;
        app.db.transaction((tx)=>{
            tx.executeSql('SELECT * FROM '+StorageMgr.TABLE_CACHE_IMAGE+' ORDER BY time DESC', [], function (tx, rs) {
                self.newestMessage = rs.rows;
                self.emitNewestMessageChange();
            });
        }, (error)=>{
            console.log('subImageRef <error>', url, error);
        });
    }
    getUserMessage(userid, time) {
        var query = {
            type: this.USER_TYPE,
            userid: userid
        };
        if (time) {
            query.time = {$lt: time};
        }
        var self = this;
        app.db_history_message.find(query, function (err, docs) {
            var message = _.sortBy(docs, function (obj) {
                return -obj.time;
            }).slice(0, self.PER_COUNT);

            if (time) {
                self.displayMessage = message.reverse().concat(self.displayMessage);
            } else {
                self.displayMessage = message.reverse();
            }
            self.emitDisplayMessageChange();
        });
    }
    getGroupMessage(groupid, time) {
        var query = {
            type: this.GROUP_TYPE,
            groupid: groupid
        };
        if (time) {
            query.time = {$lt: time};
        }
        var self = this;
        app.db_history_message.find(query, function (err, docs) {
            var message = _.sortBy(docs, function (obj) {
                return -obj.time;
            }).slice(0, self.PER_COUNT);

            if (time) {
                self.displayMessage = message.reverse().concat(self.displayMessage);
            } else {
                self.displayMessage = message.reverse();
            }
            self.emitDisplayMessageChange();
        });
    }
    increaseUserUnreadNotify(userid) {
        var obj = this.unreadMessage.users;
        if (!obj[userid]) {
            obj[userid] = 1;
        } else {
            obj[userid]++;
        }
        this.unreadMessage.total++;
        us.object(constants.MESSAGE_BADGES, obj);
    }
    clearUserUnreadNotify(userid) {
        var obj = this.unreadMessage.users;
        var cnt = obj[userid]||0;
        delete obj[userid];
        this.unreadMessage.total -= cnt;
        us.object(constants.MESSAGE_BADGES, obj);
    }
    increaseGroupUnreadNotify(groupid, touserid) {
        var obj = this.unreadMessage.group;
        if (!obj[groupid]) {
            obj[groupid] = 1;
        } else {
            obj[groupid]++;
        }
        us.object(constants.GROUP_MESSAGE_BADGES, obj);

        obj = this.unreadMessage.at;
        if (touserid == app.loginMgr.userid) {
            if (!obj[groupid]) {
                obj[groupid] = 1;
            } else {
                obj[groupid]++;
            }
            us.object(constants.GROUP_CHAT_AT_NUMBERS, obj);
        }
        this.unreadMessage.total++;
    }
    clearGroupUnreadNotify(groupid) {
        var obj = this.unreadMessage.group;
        var cnt = obj[groupid]||0;
        delete obj[groupid];
        this.unreadMessage.total -= cnt;
        us.object(constants.GROUP_MESSAGE_BADGES, obj);
    }
    removeLeftGroupMessages(groupid) {
        this.clearGroupUnreadNotify(groupid);
        app.db_history_message.delete({type:this.GROUP_TYPE, groupid:groupid});
        var self = this;
        app.db_newest_message.delete({type:this.GROUP_TYPE, groupid:groupid}, function() {
            self.emitNewestMessageChange();
        });
    }
    showNewestMessage(type, userid, groupid, time, msg, msgtype, send, touserid) {
        var display;
        var isGroup = (type===this.GROUP_TYPE);
        var newest_message = {userid:userid, groupid:groupid, time: time, msg: msg, msgtype:msgtype, touserid:touserid};

        if (isGroup) {
            display = this.displayMessageInfo.target===groupid;
            if (!(app.state.currentView==="messageInfo" && display)) {
                this.increaseGroupUnreadNotify(groupid, touserid);
            }
            this.newestMessage = _.reject(this.newestMessage, function(item){return item.groupid==groupid&&item.type==type});
            this.newestMessage.unshift(assign({type:type, groupid:groupid}, newest_message));
            app.db_newest_message.upsert({type: type, groupid: groupid}, newest_message);
            console.log("update newest_message_db", {type: type, groupid: groupid}, {groupid: groupid,time: time, msg: msg, msgtype:msgtype});
        } else {
            display = this.displayMessageInfo.target===userid;
            if (!(app.state.currentView==="messageInfo" && display)) {
                this.increaseUserUnreadNotify(userid);
            }
            this.newestMessage = _.reject(this.newestMessage, function(item){return item.userid==userid&&item.type==type});
            this.newestMessage.unshift(assign({type:type, userid:userid}, newest_message));
            app.db_newest_message.upsert({type: type, userid: userid}, newest_message);
            console.log("update newest_message_db", {type: type, userid: userid}, {time: time, msg: msg, msgtype:msgtype});
        }
        this.emitNewestMessageChange();

        var display_message = {type:type, userid:userid, groupid:groupid, time:time, msg:msg, msgtype:msgtype};
        if (send != null ) {
            display_message.send = send;
        }
        if (touserid) {
            display_message.touserid = touserid;
        }
        if (display) {
            this.displayMessage.push(display_message);
            this.emitDisplayMessageChange();
        }

        app.db_history_message.insert(display_message);
        console.log("update history_message_db", display_message);
    }
    sendUserMessage(users, msg, msgtype) {
        this.increaseMsgId();
        app.emit('USER_SEND_MESSAGE_RQ', {type:this.USER_TYPE, to:users, msg:msg, msgtype:msgtype, msgid:this.data.msgid});
        var list = users.split(',');
        var time = Date.now();
        for (var i= 0,len=list.length; i<len; i++) {
            var userid = list[i];
            this.showNewestMessage(this.USER_TYPE, userid, null,  time, msg, msgtype, this.data.msgid);
        }
    }
    sendGroupMessage(groupid, msg, msgtype, touserid) {
        this.increaseMsgId();
        app.emit('USER_SEND_MESSAGE_RQ', {type:this.GROUP_TYPE, to:groupid, msg:msg, msgtype:msgtype, msgid:this.data.msgid, touserid:touserid});
        var time = Date.now();
        this.showNewestMessage(this.GROUP_TYPE, app.loginMgr.userid, groupid, time, msg, msgtype, this.data.msgid, touserid);
    }
    onSendUserMessage(obj) {
        if (obj.error) {
            console.log(error);
        } else {
            console.log("send to "+obj.to+" ["+obj.msgid+"]", obj.time, "server success");
        }
    }
    addMessageNotification(userid, groupid, message) {
        var username;
        if (userid !== null) {
            username = app.userMgr.users[userid].username;
        } else {
            username = "【群】:"+app.groupMgr.list[groupid].name;
        }
        username = "来自 "+username+" 的消息"
        navigator.utils.addNotification(app.constants.MESSAGE_NOTIFY_ID, username, message);
    }
    showUserMessage(obj) {
        app.sound.playSound(app.resource.aud_message_tip);
        if (obj.type == this.USER_TYPE) {
            this.addMessageNotification(obj.from, null, obj.msg);
            this.showNewestMessage(this.USER_TYPE, obj.from, null, obj.time, obj.msg, obj.msgtype);
            console.log('['+obj.from+']','['+obj.msgid+']:', obj.msg, obj.msgtype, obj.time);
        } else {
            this.addMessageNotification(null, obj.groupid, obj.msg);
            this.showNewestMessage(this.GROUP_TYPE, obj.from, obj.groupid, obj.time, obj.msg, obj.msgtype, null, obj.touserid);
            console.log(' group:'+obj.groupid, ' ['+obj.from+']',' ['+obj.msgid+']:', obj.msg, obj.msgtype, obj.time, obj.touserid);
        }
    }
    onUserMessageReceived(obj) {
        console.log(' ['+obj.msgid+']:',  obj.to, 'received');
    }
    noticeNewMessage(obj) {
        return;
        app.sound.playSound(app.resource.aud_new_message);
    }
    showOfflineMessage(obj) {
        if (!app.uiMessage.hasUpdateLogMessage) {
            setTimeout(function() {
                this.showOfflineMessage(obj);
            }, 200);
        } else {
            var len = obj.length;
            var allUsers = app.userMgr.users;
            if (len) {
                this.noticeNewMessage();
            }
            for (var i = 0; i < len; i++) {
                var item = obj[i];
                if (item.type == this.GROUP_TYPE) {
                    console.log(' [' + item.groupid + ']', ' [' + item.from + '][' + item.time + ']:', item.msg);
                    this.showNewestMessage(this.GROUP_TYPE, item.from, item.groupid, new Date(item.time).getTime(), item.msg, item.msgtype, null, item.touserid);
                } else {
                    console.log(' [' + item.from + '][' + new Date(item.time).getTime() + ']:', item.msg);
                    this.showNewestMessage(this.USER_TYPE, item.from, allUsers[item.from].username, new Date(item.time).getTime(), item.msg, item.msgtype);
                }
            }
        }
    }
    getUserMessageFromServer(counter, time) {
        app.emit('USER_GET_MESSAGE_RQ', {type:this.USER_TYPE, counter:counter, time:time, cnt:this.PER_COUNT});
    }
    getGroupMessageFromServer(counter, time) {
        app.emit('USER_GET_MESSAGE_RQ', {type:this.GROUP_TYPE, counter:counter, time:time, cnt:this.PER_COUNT});
    }
    onGetMessage(obj) {
        var type = obj.type;
        var msg = obj.msg;
        var _id = obj._id;
        var selfid = app.loginMgr.userid;
        var arr = _.map(msg, function(item) {
            var from = item.from;
            var to = item.to;
            var obj;
            if (from == selfid) {
                return {userid:to, msg:item.msg, msgtype:item.msgtype, time:new Date(item.time).getTime(), send:item.msgid};
            } else {
                return {userid:from, msg:item.msg, msgtype:item.msgtype, time:new Date(item.time).getTime()};
            }
        });
        this.displayMessage = arr.reverse().concat(this.displayMessage);
        this.emitDisplayMessageChange();
    }
}
