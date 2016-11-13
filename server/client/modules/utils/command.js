module.exports = define(function(require) {
    var _self;

    function Command() {
        _self = this;
    }

    Command.prototype.start = function() {
        app.rl.on('line', function (line) {
            var cmd = _self.parseCommand(line);
            if (cmd.users) {
                if (_self.checkLogin()) {
                    _self.sendUserMessage(cmd.users, cmd.args);
                }
            } else if (cmd.group){
                if (_self.checkLogin()) {
                    _self.sendGroupMessage(cmd.group, cmd.args);
                }
            } else {
                switch (cmd.cmd) {
                    case 'h':
                    case 'help':
                    case 'q':
                    case 'exit':
                    case 'l':
                    case 'login':
                    case 'r':
                    case 'register':
                        _self.execCommand(cmd.cmd, cmd.args);
                        break;
                    default:
                        if (_self.checkLogin()) {
                         _self.execCommand(cmd.cmd, cmd.args);
                        }
                }
            }
        });
        app.socketMgr.start();
    };
    Command.prototype.sendUserMessage = function(users, msg) {
        var mgr = app.messageMgr;
        app.console.log('red@['+users+']', msg);
        if (/^\[image\]:/.test(msg)) {
            msg = msg.replace(/^\[image\]:/, '');
            msg = app.images.getUserHead(parseInt(msg));
            mgr.sendUserMessage(users, msg, mgr.IMAGE_TYPE);
        } else if (/^\[audio\]:/.test(msg)) {
            msg = msg.replace(/^\[audio\]:/, '');
            msg = app.images.getUserHead(parseInt(msg));
            mgr.sendUserMessage(users, msg, mgr.AUDIO_TYPE);
        } else if (/^\[video\]:/.test(msg)) {
            msg = msg.replace(/^\[video\]:/, '');
            msg = app.images.getUserHead(parseInt(msg));
            mgr.sendUserMessage(users, msg, mgr.VIDEO_TYPE);
        } else {
            msg = msg.replace(/\[e(\d+)\]/g, '<img class="semoji emoji_$1" src="resource/transparent.png">')
            mgr.sendUserMessage(users, msg, mgr.TEXT_TYPE);
        }
    };
    Command.prototype.sendGroupMessage = function(group, msg) {
        var mgr = app.messageMgr;
        app.console.log('magenta@['+group+']', msg);
        if (/^\[image\]:/.test(msg)) {
            msg = msg.replace(/^\[image\]:/, '');
            msg = app.images.getUserHead(parseInt(msg));
            mgr.sendGroupMessage(group, msg, mgr.IMAGE_TYPE);
        } else if (/^\[audio\]:/.test(msg)) {
            msg = msg.replace(/^\[audio\]:/, '');
            msg = app.images.getUserHead(parseInt(msg));
            mgr.sendGroupMessage(group, msg, mgr.AUDIO_TYPE);
        } else if (/^\[video\]:/.test(msg)) {
            msg = msg.replace(/^\[video\]:/, '');
            msg = app.images.getUserHead(parseInt(msg));
            mgr.sendGroupMessage(group, msg, mgr.VIDEO_TYPE);
        } else {
            msg = msg.replace(/\[e(\d+)\]/g, '<img class="semoji emoji_$1" src="resource/transparent.png">')
            mgr.sendGroupMessage(group, msg, mgr.TEXT_TYPE);
        }
    };
    Command.prototype.getHistoryMessage = function(args) {
        args = args.trim().split(/\s+/);
        if (args.length < 4) {
            app.console.error("invalid param");
        } else {
            app.messageMgr.getMessage(args[0], args[1], args[2], args[3]);
        }
    };
    Command.prototype.checkLogin = function() {
        if (!app.login.online) {
            app.console.error('please login first');
            return false;
        } else {
            return true;
        }
    };
    Command.prototype.parseCommand = function(line) {
        var ret = {};
        if (/^\/[\w|,]+/.test(line)) {
            var users = line.match(/[\w|,]+/)[0];
            var args = line.substr(users.length+2, line.length);
            ret.users = users;
            ret.args = args;
        } else if (/^:\S+/.test(line)) {
            var group = line.match(/[\S|,]+/)[0];
            var args = line.substr(group.length+1, line.length);
            ret.group = group.substr(1)*1;
            ret.args = args;
        } else if (/\w+/.test(line)){
            var cmd = line.match(/\w+/)[0];
            var args = line.substr(cmd.length+1, line.length);
            ret.cmd = cmd;
            ret.args = args;
        }
        return ret;
    };
    Command.prototype.dealGroupCommand = function(args) {
        args = args.trim().split(/\s+/);
        if (args[0]=='l' || args[0]=='list') {
            var obj = {};
            if (args[1]) {
                try {
                    obj = JSON.parse(args[1])||{};
                } catch (e) {}
            }
            app.groupMgr.getGroupList(obj.name, obj.creators, obj.users);
        } else if (args[0]=='c' || args[0]=='create') {
            if (/^\S+$/.test(args[1])) {
                var users = args[2]&&args[2].split(',')||[];
                app.groupMgr.createGroup(args[1], users, args[3]);
            } else {
                _self.invalidCommand();
            }
        } else if (args[0]=='m' || args[0]=='modify') {
            if (/^\S+$/.test(args[1])) {
                var users = args[3]&&args[3].split(',')||[];
                app.groupMgr.modifyGroup(args[1]*1, args[2], users, args[4]);
            } else {
                _self.invalidCommand();
            }
        } else if (args[0]=='d' || args[0]=='delete') {
            if (/^\S+$/.test(args[1])) {
                app.groupMgr.removeGroup(args[1]*1);
            } else {
                _self.invalidCommand();
            }
        } else if (args[0]=='j' || args[0]=='join') {
            if (/^\S+$/.test(args[1])) {
                app.groupMgr.joinGroup(args[1]*1);
            } else {
                _self.invalidCommand();
            }
        } else if (args[0]=='q' || args[0]=='leave') {
            if (/^\w+$/.test(args[1])) {
                app.groupMgr.leaveGroup(args[1]*1);
            } else {
                _self.invalidCommand();
            }
        } else if (args[0]=='i' || args[0]=='info') {
            if (/^\S+$/.test(args[1])) {
                app.groupMgr.getGroupInfo(args[1]*1);
            } else {
                _self.invalidCommand();
            }
        } else if (args[0]=='p' || args[0]=='pull') {
            if (/^\S+$/.test(args[1]) && /^[\w|,]+$/.test(args[2])) {
                app.groupMgr.pullInGroup(args[1]*1, args[2]);
            } else {
                _self.invalidCommand();
            }
        } else if (args[0]=='f' || args[0]=='fire') {
            if (/^\S+$/.test(args[1]) && /^[\w|,]+$/.test(args[2])) {
                app.groupMgr.fireOutGroup(args[1]*1, args[2]);
            } else {
                _self.invalidCommand();
            }
        } else {
            _self.invalidCommand();
        }
        app.console.prompt();
    };
    Command.prototype.execCommand = function(cmd, args) {
        switch (cmd) {
            case 'h':
                case 'help':
                _self.showHelp();
            break;
            case 'q':
                case 'exit':
                process.exit();
            break;
            case 'r':
                case 'register':
                app.register.register(args);
                break;
            case 'l':
                case 'login':
                app.login.login(args);
            break;
            case 'ou':
                case 'onlineusers':
                app.userMgr.showOnlineUserList();
            break;
            case 'u':
                case 'users':
                app.userMgr.showUserList();
            break;
            case 'he':
                case 'head':
                app.userInfo.updateUserHead(args);
            break;
            case 'ui':
                case 'update':
                app.userInfo.updateUserInfo(args);
            break;
            case 'hi':
                case 'history':
                _self.getHistoryMessage(args);
            break;
            case 'g':
                case 'groups':
                _self.dealGroupCommand(args);
            break;
            case 'i':
                case 'whoami':
                app.login.showMyselfInfo();
            break;
            default:
                _self.invalidCommand();
            app.console.prompt();
        }
    };
    Command.prototype.invalidCommand = function() {
        app.console.error('invalid command, :help for help');
    };
    Command.prototype.showHelp = function() {
        app.console.print('you can follows commands:', 'blue');
        app.console.print('    <h|help>: show help');
        app.console.print('    <q|exit>: exit client');
        app.console.print('    <r|register [username phone email password]>: register, username,phone,email and password is opiton');
        app.console.print('    <l|login [username password]>: login, username and password is opiton');
        app.console.print('    <ou|onlineusers>: show users online');
        app.console.print('    <u|users>: show all users online and offline');
        app.console.print('    <he|head> [head]: update user\'s head, head is a number in[0, 32]');
        app.console.print('    <ui|update> [username sign]: update user\'s info');
        app.console.print('    <g|groups l|list {name:xx,users:xx,creators:xx}>: show group list, userid and creators is option');
        app.console.print('    <g|groups i|info group>: show group info');
        app.console.print('    <g|groups c|create|m|modify group [name users[1,2,3] type[0|1]]|d|delete group>: create, modify or delete group');
        app.console.print('    <g|groups j|join|q|leave group>: join or leave group or show group');
        app.console.print('    <g|groups p|pull|f|fire group userid,userid>: pull or fire users to a group, only creator');
        app.console.print('    <hi|history [type counter time cnt]>: show history messages');
        app.console.print('    <i|whoami>: show self info');
        app.console.print('you can send message to user<s> like:');
        app.console.print('    /userid msg <send to single user>');
        app.console.print('    /userid,userid msg <send to multi users>');
        app.console.print('you can send message to group like:');
        app.console.print('    :group msg <send to single group>');
        app.console.print('message type:');
        app.console.print('    :[image]:\d [audio]:\d [video]:\d otherwise text message');
        app.console.print('    :in text message, use \":number:\" send emoji, number in [0, 105], send \":\" use \"::\"');
        app.console.prompt();
    };
    return new Command();
});
