'use strict';
var ReactNative = require('react-native');
var {
    AsyncStorage,
} = ReactNative;
var EventEmitter = require('EventEmitter');

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
    }
    get() {
        return new Promise(async(resolve, reject)=>{
            var data = null;
            try {
                var infoStr = await AsyncStorage.getItem(ITEM_NAME);
                data = JSON.parse(infoStr);
            } catch(e) {
                data = null;
            }
            this.data = data || {msgid: 1, unreadGroupMessage: {}, unreadUsersMessage: {}, unreadAtMessage: {}};
            this.totalUnreadMessage = _.sum(_.values(this.unreadGroupMessage)) + _.sum(_.values(this.unreadUsersMessage));
        });
    }
    set(data) {
        return new Promise(async(resolve, reject)=>{
            if (data) {
                this.data = data;
            }
            await AsyncStorage.setItem(ITEM_NAME, JSON.stringify(this.data));
            resolve();
        });
    }
    setUserID(userid) {
        this.userid = userid;
        this.NEWEST_MESSAGE_COLLECTION = 'NEWEST_MESSAGE_COLLECTION_'+userid;
        this.NEWEST_MESSAGE_COLLECTION = 'NEWEST_MESSAGE_COLLECTION_'+userid;
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
        this.set();
    }
    getNewestMessage() {
        var self = this;
        app.db.transaction((tx)=>{
            tx.executeSql('SELECT * FROM newest_message ORDER BY time DESC', [], (tx, rs)=>{
                var {rows} = rs;
                for (var i = 0, len = rows.length; i < len; i++){
                    self.newestMessage.push(rows.item(i));
                }
                self.emitNewestMessageChange();
            });
        }, (error)=>{
            console.log('getNewestMessage <error>');
        });
    }
    getUserMessage(userid, page) {
        app.db.transaction((tx)=>{
            tx.executeSql('SELECT * FROM history_message WHERE userid=? AND type=? ORDER BY time DESC LIMIT ? OFFSET ?',
            [userid, this.USER_TYPE, self.PER_COUNT, self.PER_COUNT*page], (tx, rs)=>{
                var {rows} = rs, docs = [];
                for (var i = 0, len = rows.length; i < len; i++){
                    docs.push(rows.item(len-i-1));
                }
                self.newestMessage = docs;
                self.emitDisplayMessageChange();
            });
        }, (error)=>{
            console.log('getUserMessage <error>');
        });
    }
    getGroupMessage(groupid, page) {
        app.db.transaction((tx)=>{
            tx.executeSql('SELECT * FROM history_message WHERE groupid=? AND type=? ORDER BY time DESC LIMIT ? OFFSET ?',
            [groupid, this.GROUP_TYPE, self.PER_COUNT, self.PER_COUNT*page], (tx, rs)=>{
                var {rows} = rs, docs = [];
                for (var i = 0, len = rows.length; i < len; i++){
                    docs.push(rows.item(len-i-1));
                }
                self.newestMessage = docs;
                self.emitDisplayMessageChange();
            });
        }, (error)=>{
            console.log('getGroupMessage <error>');
        });
    }
    increaseUserUnreadNotify(userid) {
        var obj = this.data.unreadUsersMessage;
        obj[userid] = (obj[userid]||0)+1;
        this.totalUnreadMessage++;
        this.set();
    }
    clearUserUnreadNotify(userid) {
        var obj = this.data.unreadUsersMessage;
        var cnt = obj[userid]||0;
        delete obj[userid];
        this.totalUnreadMessage -= cnt;
        this.set();
    }
    increaseGroupUnreadNotify(groupid, touserid) {
        var obj = this.data.unreadGroupMessage;
        obj[groupid] = (obj[groupid]||0)+1;

        obj = this.data.unreadAtMessage;
        if (touserid == app.loginMgr.userid) {
            obj[groupid] = (obj[groupid]||0)+1;
        }
        this.unreadMessage.total++;
        this.set();
    }
    clearGroupUnreadNotify(groupid) {
        var obj = this.data.unreadGroupMessage;
        var cnt = obj[groupid]||0;
        delete obj[groupid];
        this.totalUnreadMessage -= cnt;
        this.set();
    }
    removeLeftGroupMessages(groupid) {
        this.clearGroupUnreadNotify(groupid);
        app.db.transaction((tx)=>{
            tx.executeSql('DELETE FROM newest_message WHERE type=? AND groupid=?', [type, groupid], (tx, rs)=>{
                self.emitNewestMessageChange();
            });
        }, (error)=>{
            console.log('removeLeftGroupMessages <error>');
        });
        app.db.transaction((tx)=>{
            tx.executeSql('DELETE FROM history_message WHERE type=? AND groupid=?', [type, groupid], (tx, rs)=>{
            });
        }, (error)=>{
            console.log('removeLeftGroupMessages <error>');
        });
    }
    showNewestMessage(type, userid, groupid, time, msg, msgtype, send, touserid) {
        var display;
        var isGroup = (type===this.GROUP_TYPE);
        if (isGroup) {
            display = this.displayMessageInfo.target===groupid;
            if (!(app.state.currentView==="messageInfo" && display)) {
                this.increaseGroupUnreadNotify(groupid, touserid);
            }
            this.newestMessage = _.reject(this.newestMessage, (item)=>item.groupid==groupid&&item.type==type);
            this.newestMessage.unshift({type, userid, groupid, time, msg, msgtype, touserid});
            tx.executeSql('UPDATE newest_message SET userid=?, time=?, msg=?, msgtype=?, send=?, touserid=? WHERE type=? AND groupid=?',
                [userid, time, msg, msgtype, send, touserid, type, groupid], (tx, rs)=>{
                if (rs.rowsAffected == 0) {
                    tx.executeSql('INSERT INTO newest_message (type, userid, groupid, time, msg, msgtype, send, touserid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [type, userid, groupid, time, msg, msgtype, send, touserid], (tx, rs)=>{
                        //console.log('subImageRef <insert>', url, size);
                    });
                }
            });

        } else {
            display = this.displayMessageInfo.target===userid;
            if (!(app.state.currentView==="messageInfo" && display)) {
                this.increaseUserUnreadNotify(userid);
            }
            this.newestMessage = _.reject(this.newestMessage, (item)=>item.userid==userid&&item.type==type);
            this.newestMessage.unshift({type, userid, groupid, time, msg, msgtype, touserid});
            tx.executeSql('UPDATE newest_message SET time=?, msg=?, msgtype=?, send=?, touserid=? WHERE type=? AND userid=?',
                [time, msg, msgtype, send, touserid, type, userid], (tx, rs)=>{
                if (rs.rowsAffected == 0) {
                    tx.executeSql('INSERT INTO newest_message (type, userid,  time, msg, msgtype, send, touserid) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [type, userid, time, msg, msgtype, send, touserid], (tx, rs)=>{
                        //console.log('subImageRef <insert>', url, size);
                    });
                }
            });
        }
        this.emitNewestMessageChange();
        var display_message = {type, userid, groupid, time, msg, msgtype, send, touserid};
        if (display) {
            this.displayMessage.push(display_message);
            this.emitDisplayMessageChange();
        }
        app.db.transaction((tx)=>{
            tx.executeSql('INSERT INTO history_message (type, userid, groupid, time, msg, msgtype, send, touserid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [type, userid, groupid, time, msg, msgtype, send, touserid], (tx, rs)=>{
            });
        }, (error)=>{
            console.log('removeLeftGroupMessages <error>');
        });
    }
    sendUserMessage(users, msg, msgtype) {
        this.increaseMsgId();
        app.socketMgr.emit('USER_SEND_MESSAGE_RQ', {type:this.USER_TYPE, to:users, msg:msg, msgtype:msgtype, msgid:this.data.msgid});
        var list = users.split(',');
        var time = Date.now();
        for (var i = 0,len = list.length; i < len; i++) {
            var userid = list[i];
            this.showNewestMessage(this.USER_TYPE, userid, null,  time, msg, msgtype, this.data.msgid);
        }
    }
    sendGroupMessage(groupid, msg, msgtype, touserid) {
        this.increaseMsgId();
        app.socketMgr.emit('USER_SEND_MESSAGE_RQ', {type:this.GROUP_TYPE, to:groupid, msg:msg, msgtype:msgtype, msgid:this.data.msgid, touserid:touserid});
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
        app.socketMgr.emit('USER_GET_MESSAGE_RQ', {type:this.USER_TYPE, counter:counter, time:time, cnt:this.PER_COUNT});
    }
    getGroupMessageFromServer(counter, time) {
        app.socketMgr.emit('USER_GET_MESSAGE_RQ', {type:this.GROUP_TYPE, counter:counter, time:time, cnt:this.PER_COUNT});
    }
    onGetMessage(obj) {
        var msg = obj.msg;
        var selfid = app.loginMgr.userid;
        var arr = _.map(msg, (item)=>{
            if (from == selfid) {
                return {userid:item.to, msg:item.msg, msgtype:item.msgtype, time:new Date(item.time).getTime(), send:item.msgid};
            } else {
                return {userid:item.from, msg:item.msg, msgtype:item.msgtype, time:new Date(item.time).getTime()};
            }
        });
        this.displayMessage = arr.reverse().concat(this.displayMessage);
        this.emitDisplayMessageChange();
    }
}
