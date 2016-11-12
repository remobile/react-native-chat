module.exports = define(function(require) {
    var _self;

    function Register() {
        _self = this;
    }

    Register.prototype.register = function(args) {
        args = args.trim().split(/\s+/);
        if (args.length >= 4) {
            _self.username = args[0];
            _self.phone = args[1];
            _self.password = args[2];
            _self.email = args[3];
            _self.doRegister();
        } else {
            _self.questionUserName();
        }
    };
    Register.prototype.questionUserName = function() {
        app.console.question("UserName: ", function(name) {
            name = name.trim();
            if (!name) {
                app.console.error("UserName is null");
                _self.questionUserName();
            } else {
                _self.username = name;
                _self.questionPhone();
            }
        });
    };
    Register.prototype.questionPhone = function() {
        app.console.question("Phone: ", function(phone) {
            phone = phone.trim();
            //if (/^1[\d]{10}/.test(phone)) {
            if (phone) {
                _self.phone = phone;
                _self.questionEmail();
            } else {
                app.console.error("phone is invalid");
                _self.questionPhone();
            }
        });
    };
    Register.prototype.questionEmail = function() {
        app.console.question("Email: ", function(email) {
            email = email.trim();
            //if (/^1[\d]{10}/.test(phone)) {
            if (email) {
                _self.email = email;
                _self.questionPassword();
            } else {
                app.console.error("email is invalid");
                _self.questionEmail();
            }
        });
    };
    Register.prototype.questionPassword = function() {
        app.console.question("PassWord: ", function(pwd) {
            pwd = pwd.trim();
            if (!pwd) {
                app.console.error("PassWord is null");
                _self.questionPassword();
            } else {
                _self.password = pwd;
                _self.doRegister();
            }
        });
    };
    Register.prototype.doRegister = function() {
        var param = {
            userid: _self.phone,
            password: _self.password,
            username: _self.username,
            email: _self.email,
        };
        app.socket.emit('USER_REGISTER_RQ', param);
    };
    Register.prototype.onRegister = function(obj) {
        if (!obj.error) {
            app.console.success("register success, you can login now!");
        } else {
            app.console.error(obj.error);
        }
    };
    Register.prototype.onRegisterNotify = function(obj) {
        app.console.log(obj);
        app.userMgr.add({userid:obj.userid, username: obj.username, sign:obj.sign});
    };
    return new Register();
});
