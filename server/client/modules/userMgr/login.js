var _self;

function Login() {
    _self = this;
}

Login.prototype.login = function(args) {
    if (_self.online) {
        app.console.error("you have already login");
        return;
    }
    args = args.trim().split(/\s+/);
    if (args.length >= 2) {
        _self.userid = args[0];
        _self.password = args[1];
        _self.doLogin();
    } else {
        _self.questionPhoneNumber();
    }
};
Login.prototype.questionPhoneNumber = function() {
    app.console.question("PhoneNumber: ", function(phone) {
        phone = phone.trim();
        if (!phone) {
            app.console.error('phone number is null');
            _self.questionPhoneNumber();
        } else {
            _self.userid = phone;
            _self.questionPassWord();
        }
    });
};
Login.prototype.questionPassWord = function() {
    app.console.question("PassWord:", function(pwd) {
        pwd = pwd.trim();
        if (!pwd) {
            app.console.error('password is null');
            _self.questionPassWord();
        } else {
            _self.password = pwd;
            _self.doLogin();
        }
    });
};
Login.prototype.doLogin = function() {
    var param = {
        userid: _self.userid,
        password: _self.password
    };
    app.socket.emit('USER_LOGIN_RQ', param);
};
Login.prototype.onLogin = function(obj) {
    if (!obj.error) {
        app.console.success("login success");
        app.console.log(obj);
        _self.online = true;
        _self.info = obj;
        app.socket.emit('USER_LOGIN_SUCCESS_NFS');
    } else {
        app.console.error(obj.error);
    }
};
Login.prototype.showMyselfInfo= function() {
    app.console.log("I am", "red@"+_self.info.username, _self.userid, app.groupMgr.list);
};
Login.prototype.loginAgain = function() {
    var param = {
        userid: _self.userid,
        password: _self.password,
        reconnect: true
    };
    app.socket.emit('USER_LOGIN_RQ', param);
};
module.exports = new Login();
