var _ = require("underscore");
module.exports = (function() {
    "use strict";
    function NotifyMgr() {
    }

    NotifyMgr.prototype.onNotify = function(obj) {
        app.emit('USERS_NOTIFY_NFS');
        console.log(obj);
        var have_head_users = [];
        app.db_user_head.find(function(err, docs) {
            _.each(docs, function(doc) {
                have_head_users.push(doc.userid);
            });
            var have_notify_users = [];
            var head = obj.head;
            for (var i= 0,len=head.length; i<len; i++) {
                var item = head[i];
                this.updateUserHead(item);
                have_notify_users.push(item.userid);
            }

            var users = app.userMgr.users;
            var all_users = _.keys(users);
            var need_update_users = _.difference(all_users, have_notify_users, have_head_users);
            app.emit('USERS_GET_HEAD_RQ', need_update_users);
        });
    };
    NotifyMgr.prototype.updateUserHead = function(obj) {
        var userid = obj.userid;
        var head = obj.head;
        app.db_user_head.upsert({userid: userid}, {head: head});
        $.upsertStyleSheet(app.userHeadCss, '.user_head_'+userid, 'background-image:url('+head+')');
    };
    NotifyMgr.prototype.onGetUserHead = function(obj) {
        for (var i= 0,len=obj.length; i<len; i++) {
            var item = obj[i];
            this.updateUserHead(item);
        }
    };

    return new NotifyMgr();
})();
