'use strict';
var ReactNative = require('react-native');
var {
    AsyncStorage,
} = ReactNative;
var EventEmitter = require('EventEmitter');

class Manager extends EventEmitter {
    onNotify(obj) {
        app.socketMgr.emit('USERS_NOTIFY_NFS');
    }
}

module.exports = new Manager();
