module.exports = define(function(require) {
    var _self;

    function UserInfo() {
        _self = this;
    }

    UserInfo.prototype.updateUserInfo = function(args) {
        args = args.trim().split(/\s+/);
        if (args.length >= 2) {
            _self.username = args[0];
            _self.sign = args[1];
            _self.doUpdateUserInfo();
        } else {
            _self.questionUserName();
        }
    };
    UserInfo.prototype.questionUserName = function() {
        app.console.question("UserName: ", function(name) {
            name = name.trim();
            if (!name) {
                app.console.error("UserName is null");
                _self.questionUserName();
            } else {
                _self.username = name;
                _self.questionSign();
            }
        });
    };
    UserInfo.prototype.questionSign = function() {
        app.console.question("Sign: ", function(sign) {
            sign = sign.trim();
            if (!sign) {
                app.console.error("Sign is null");
                _self.questionSign();
            } else {
                _self.sign = sign;
                _self.doUpdateUserInfo();
            }
        });
    };
    UserInfo.prototype.updateUserHead = function(index) {
        var head = app.images.getUserHead(index);
        app.userMgr.updateHead(head);
    };
    UserInfo.prototype.doUpdateUserInfo = function() {
        var obj = {
            username: _self.username,
            sign: _self.sign
        };
        app.socket.emit('USERS_UPDATE_USERINFO_RQ', obj);
    };
    UserInfo.prototype.onUpdateUserInfo = function(obj) {
        app.console.log(obj);
    };
    return new UserInfo();
});
