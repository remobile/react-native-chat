global.localStorage = {};
global._ = require('lodash');

var io = require('socket.io-client');
function App() {
    this.ip = "127.0.0.1";
    this.port = 8888;
    var modulePath = __dirname + '/modules/';
    this.socket = io.connect('ws://'+this.ip+':'+this.port);
    this.error = require(modulePath+'utils/error');
    this.console = require(modulePath+'utils/console');
    this.command = require(modulePath+'utils/command');
    this.upload = require(modulePath+'utils/upload');
    this.images = require(modulePath+'images');
    this.socketMgr = require(modulePath+'socketMgr/socketMgr');
    this.router = require(modulePath+'socketMgr/router');
    this.register = require(modulePath+'userMgr/register');
    this.login = require(modulePath+'userMgr/login');
    this.userInfo = require(modulePath+'userMgr/userInfo');
    this.userMgr = require(modulePath+'userMgr/userMgr');
    this.notifyMgr = require(modulePath+'userMgr/notifyMgr');
    this.messageMgr = require(modulePath+'messageMgr/messageMgr');
    this.groupMgr = require(modulePath+'groupMgr/groupMgr');
}
App.prototype.start = function() {
    app.command.start();
};

app = new App();
app.start();
