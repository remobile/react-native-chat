module.exports = define(function(require) {
    function UserMgr() {
        this.reset();
    }

    UserMgr.prototype.reset = function() {
        this.users = {};
        this.init = false;
    };
    UserMgr.prototype.add = function(obj) {
        var users = this.users;
        var userid = obj.userid;
        if(!users.hasOwnProperty(userid)) {
            users[userid] = obj;
        }
    };
    UserMgr.prototype.remove = function(obj) {
        var users = this.users;
        var userid = obj.userid;
        if(users.hasOwnProperty(userid)) {
            delete users[userid];
        }
    };
    UserMgr.prototype.addList = function(list) {
        var users = this.users;
        for (var i in list) {
            var userid =list[i].userid;
            if(!users.hasOwnProperty(userid)) {
                users[userid] = list[i];
            }
        }
    };
    UserMgr.prototype.online = function(obj) {
        var userid = obj.userid;
        this.users[userid].online = true;
        app.console.log("red@"+userid, "login");
    };
    UserMgr.prototype.offline = function(obj) {
        var userid = obj.userid;
        this.users[userid].online = false;
        app.console.log("red@"+userid, "logout");
    };
    UserMgr.prototype.showUserList = function() {
        var users = this.users;
        var list = [];
        for (var userid in users) {
            var user = users[userid];
            var color = user.online?"green":"gray";
            list.push(color+"@"+userid+":"+user.username);
        }
        app.console.log.apply(null, list);
    };
    UserMgr.prototype.showOnlineUserList = function() {
        var users = this.users;
        var list = [];
        for (var userid in users) {
            var user = users[userid];
            if (user.online) {
                list.push("green@"+userid+":"+user.username);
            }
        }
        app.console.log.apply(null, list);
    };
    UserMgr.prototype.updateHead = function(file) {
        var options = {
            url:'http://'+app.ip+':'+app.port+'/api/uploadUserHead',
            method: 'POST',
            verbose: true,
            param:'file', //文件上传字段名
            file, //文件位置
            fields:{ //其余post字段
            	userid: app.login.userid,
            }
        };
        app.upload(options).then(function(data) {
            app.console.log('green@success', data);
        }, function() {
            app.console.log('red@error');
        }, function( progress ) {
            app.console.log('gray@upload progress', progress);
        });

    };

    return new UserMgr();
});
