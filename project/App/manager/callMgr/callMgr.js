var EventEmitter = require('events').EventEmitter;
var assign = require("object-assign");
var us = require('../../utils/userSetting');
var constants = require('../../utils/constants');

module.exports = (function() {
    "use strict";

    function CallMgr() {
        assign(this, EventEmitter.prototype);

        this.callid = localStorage.callid||1;
        //call type
        this.AUDIO_TYPE = 0;
        this.VIDEO_TYPE = 1;

        //call state
        this.STATE_FREE = 0;    //next: STATE_CALLOUT STATE_CALLIN
        this.STATE_CALLOUT = 1; //next: STATE_ERROR STATE_BUSY STATE_REFUSE STATE_CALLING STATE_DISCONNECT
        this.STATE_CALLIN = 2;  //next: STATE_FREE STATE_CALLING STATE_DISCONNECT
        this.STATE_CALLING = 3; //next: STATE_HANGUP STATE_DISCONNECT
        this.STATE_BUSY = 4;    //next: STATE_FREE
        this.STATE_REFUSE = 5;  //next: STATE_FREE
        this.STATE_HANGUP = 6;  //next: STATE_FREE
        this.STATE_ERROR = 7;  //next: STATE_FREE
        this.STATE_DISCONNECT = 8;  //next: STATE_FREE

        this.state = this.STATE_FREE;
        this.delay = 3000;
        this.longdelay = 10000;
        this.session = null;
        this.time = {hour:0, minute:0, second:0};
    }

    CallMgr.prototype.emitCallChange = function(data) {
        this.emit("call_change", data);
    };
    CallMgr.prototype.addCallChangeListener = function(callback) {
        this.on("call_change", callback);
    };
    CallMgr.prototype.removeCallChangeListener = function(callback) {
        this.removeListener("call_change", callback);
    };
    CallMgr.prototype.updateTime = function(callback) {
        var self = app.callMgr;
        var time = self.time;
        var STATUS = ['空闲中...', '拨号中...','电话呼入...', '通话中...', '对方正在通话中', '对方拒绝接听', '对方终止了电话',  '对方不在线', '断开了连接'];

        if (self.state===self.STATE_FREE) {
            return;
        }
        if (self.state!==self.STATE_HANGUP&&self.state!==self.STATE_REFUSE) {
            time.second++;
            if (time.second === 60) {
                time.second = 0;
                time.minute++;
                if (time.minute === 60) {
                    time.minute = 0;
                    time.hour++;
                }
            }
        }
        var hour = time.hour;
        var minute = time.minute;
        var second = time.second;
        time = (hour<10?'0':'')+hour+':'+(minute<10?'0':'')+minute+':'+(second<10?'0':'')+second;
        callback(time, STATUS[self.state]);
        setTimeout(self.updateTime, 1000, callback);
    };
    CallMgr.prototype.increaseCallId = function() {
        this.callid++;
        if (!this.callid) {
            this.callid = 1;
        }
        localStorage.callid = this.callid;
    };
    CallMgr.prototype.call = function(isInitiator, userid, type, callid) {
        console.log('calling to ' + userid + ', isInitiator: ' + isInitiator + ', type:' + type);
        var self = this;
        var config = {
            isInitiator: isInitiator,
            turn: {
                host: 'turn:numb.viagenie.ca',
                username: 'webrtc@live.com',
                password: 'muazkh'
            },
            streams: {
                audio: true,
                video: type===this.VIDEO_TYPE
            }
        };
        var session = new navigator.phonertc.Session(config);
        session.on('sendMessage', function (data) {
            app.emit('CALL_WEBRTC_SIGNAL_NFS', {
                userid: userid,
                type: type,
                callid: callid,
                data: JSON.stringify(data)
            });
        });
        session.on('answer', function () {
            console.log('he/she is answered');
            self.emitCallChange({type:"ON_SESSION_ANSWER", userid:userid, callid:callid});
        });
        session.on('disconnect', function () {
            if (self.state === self.STATE_CALLOUT || self.state === self.STATE_CALLIN || self.state === self.STATE_CALLING ) {
                console.log('session disconnected');
                self.state = self.STATE_DISCONNECT;
                self.emitCallChange({type:"ON_PRE_CALL_HANGUP_NOTIFY", callid:callid});
                app.sound.playRing(app.resource.aud_hangup);
                app.emit('CALL_HANGUP_RQ', {userid: userid, type: type, callid: callid});
                setTimeout(function() {
                    if (self.state === self.STATE_DISCONNECT) {
                        app.sound.stopRing();
                        self.emitCallChange({type:"ON_CALL_HANGUP_NOTIFY", callid:callid});
                        self.state = self.STATE_FREE;
                    }
                }, self.delay);
            }
            self.session = null;
        });
        session.call();
        this.session = session;
    };
    CallMgr.prototype.onCallWebrtcSignalNotify = function(obj) {
        console.log('onCallWebrtcSignalNotify', obj);
        var session = this.session;
        session&&session.receiveMessage(JSON.parse(obj.data));
    };
    CallMgr.prototype.callOut = function(userid, type) {
        this.time = {hour:0, minute:0, second:0};
        this.increaseCallId();
        app.emit('CALL_OUT_RQ', {userid:userid, type:type, callid:this.callid});
        app.sound.playRing(app.resource.aud_call_out);
        this.state = this.STATE_CALLOUT;
        return this.callid;
    };
    CallMgr.prototype.onCallOut = function(obj) {
        console.log('onCallOut', obj);
        if (obj.error) {
            app.showChatError(obj.error);
            this.state = this.STATE_ERROR;
            app.sound.playRing(app.resource.aud_call_error);
            var self = this;
            setTimeout(function() {
                if (self.state === self.STATE_ERROR) {
                    app.sound.stopRing();
                    self.state = self.STATE_FREE;
                    self.emitCallChange({type:"ON_CALLOUT_ERROR", callid:obj.callid});
                }
            }, this.delay);
        }
    };
    CallMgr.prototype.onCallInNotify = function(obj) {
        console.log('onCallInNotify', obj);
        if (this.state != this.STATE_FREE) {
            app.emit('CALL_IN_NFS', {userid:obj.userid, type:obj.type, callid:obj.callid, answer:2});
            return;
        }
        this.time = {hour:0, minute:0, second:0};
        this.state = this.STATE_CALLIN;
        app.sound.playRing(app.resource.aud_call_in);
        if (obj.type === this.VIDEO_TYPE) {
            app.showView('videoCall', 'fade', {userid:obj.userid, callid:obj.callid});
        } else {
            app.showView('audioCall', 'fade', {userid:obj.userid, callid:obj.callid});
        }
    };
    CallMgr.prototype.answerCallIn = function(userid, type, callid) {
        console.log('answerCallIn', userid, type, callid);
        this.time = {hour:0, minute:0, second:0};
        this.call(false, userid, type, callid);
        app.emit('CALL_IN_NFS', {userid:userid, type:type, callid:callid, answer:0});
        app.sound.stopRing();
        this.state = this.STATE_CALLING;
    };
    CallMgr.prototype.refuseCallIn = function(userid, type, callid) {
        app.emit('CALL_IN_NFS', {userid:userid, type:type, callid:callid, answer:1});
        app.sound.stopRing();
        this.state = this.STATE_FREE;
    };
    CallMgr.prototype.onCallInReplyNotify = function(obj) {
        console.log('onCallInReplyNotify', obj);
        if (obj.answer === 0) {
            console.log("he/she answer call");
            this.emitCallChange({type:"ON_CALLOUT_ANSWERED", callid:obj.callid});
            this.call(true, obj.userid, obj.type, obj.callid);
            this.time = {hour:0, minute:0, second:0};
            app.sound.stopRing();
            this.state = this.STATE_CALLING;
        } else if (obj.answer === 1) {
            console.log("he/she refuse call");
            app.sound.playRing(app.resource.aud_refuse);
            this.state = this.STATE_REFUSE;
            var self = this;
            setTimeout(function() {
                if (self.state === self.STATE_REFUSE) {
                    app.sound.stopRing();
                    self.state = self.STATE_FREE;
                    self.emitCallChange({type:"ON_CALLOUT_REFUSED", callid:obj.callid});
                }
            }, this.delay);
        } else {
            console.log("he/she is busy");
            app.sound.playRing(app.resource.aud_busy);
            this.state = this.STATE_BUSY;
            var self = this;
            setTimeout(function() {
                if (self.state === self.STATE_BUSY) {
                    app.sound.stopRing();
                    self.state = self.STATE_FREE;
                    self.emitCallChange({type:"ON_CALLOUT_REFUSED", callid:obj.callid});
                }
            }, this.longdelay);
        }
    };
    CallMgr.prototype.callHangup = function(userid, type, callid) {
        console.log('callHangup', userid, type, callid);
        console.log(this.state);
        app.sound.stopRing();
        if (this.state === this.STATE_CALLOUT || this.state === this.STATE_CALLIN || this.state === this.STATE_CALLING ) {
            this.state = this.STATE_FREE;
            var session = this.session;
            app.emit('CALL_HANGUP_RQ', {userid: userid, type: type, callid: callid});
            session && session.close();
            this.session = null;
        }
        this.state = this.STATE_FREE;
    };
    CallMgr.prototype.onCallHangup = function(obj) {
        console.log("i hang up call");
    };
    CallMgr.prototype.onCallHangupNotify = function(obj) {
        this.emitCallChange({type:"ON_PRE_CALL_HANGUP_NOTIFY", callid:obj.callid});
        if (this.state === this.STATE_FREE) {
            return;
        }
        console.log('onCallHangupNotify', obj);
        app.sound.playRing(app.resource.aud_hangup);
        this.state = this.STATE_HANGUP;
        var self = this;
        setTimeout(function() {
            if (self.state === self.STATE_HANGUP) {
                self.state = self.STATE_FREE;
                self.emitCallChange({type:"ON_CALL_HANGUP_NOTIFY", callid:obj.callid});
                app.sound.stopRing();
            }
        }, this.delay);
        var session = this.session;
        session&&session.close();
        this.session = null;
    };

    return new CallMgr();
})();


