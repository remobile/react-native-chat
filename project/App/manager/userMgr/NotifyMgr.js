'use strict';
var ReactNative = require('react-native');
var {
    AsyncStorage,
} = ReactNative;
var EventEmitter = require('EventEmitter');
var fisrtPinyin = require('../../utils/pinyin');

class Manager extends EventEmitter {
    onNotify(obj) {
        app.socketMgr.emit('USERS_NOTIFY_NFS');
        // var have_head_users = [];
        // app.db_user_head.find(function(err, docs) {
        //     _.each(docs, function(doc) {
        //         have_head_users.push(doc.userid);
        //     });
        //     var have_notify_users = [];
        //     var head = obj.head;
        //     for (var i= 0,len=head.length; i<len; i++) {
        //         var item = head[i];
        //         this.updateUserHead(item);
        //         have_notify_users.push(item.userid);
        //     }
        //
        //     var users = app.userMgr.users;
        //     var all_users = _.keys(users);
        //     var need_update_users = _.difference(all_users, have_notify_users, have_head_users);
        //     app.emit('USERS_GET_HEAD_RQ', need_update_users);
        // });
    }
    updateUserHead(obj) {
        var {userid, head} = obj;
        // app.db_user_head.upsert({userid}, {head});
        // $.upsertStyleSheet(app.userHeadCss, '.user_head_'+userid, 'background-image:url('+head+')');
    }
    onGetUserHead(obj) {
        for (var item of obj) {
            this.updateUserHead(item);
        }
    }
}

module.exports = new Manager();
