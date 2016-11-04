var _  = require('underscore');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

module.exports = (function() {
    "use strict";

    function GroupMgr() {
        assign(this, EventEmitter.prototype);
        this.reset();
    }

    GroupMgr.prototype.emitEvent = function(data) {
        this.emit("GROUP_EVENT", data);
    };
    GroupMgr.prototype.addEventListener = function(callback) {
        this.on("GROUP_EVENT", callback);
    };
    GroupMgr.prototype.removeEventListener = function(callback) {
        this.removeListener("GROUP_EVENT", callback);
    };
    GroupMgr.prototype.reset = function() {
        this.list = {};
        this.alphaList = {};
        this.init = false;
    };
    GroupMgr.prototype.add = function(obj, noupdate) {
        var id = obj.id,
        list = this.list;
        if(!list.hasOwnProperty(id)) {
            list[id] = obj;
            this.addAlphaList(id, obj.name);
        }
    };
    GroupMgr.prototype.addAlphaList = function(id, name) {
        var alpha = $.fisrtPinyin(name);
        var alphaList = this.alphaList;
        alphaList[alpha] = alphaList[alpha]||[];
        alphaList[alpha].push(id);
    };
    GroupMgr.prototype.remove = function(obj) {
        if(this.list.hasOwnProperty(obj.id)) {
            var groupname = this.list[obj.id].name;
            delete this.list[obj.id];
            this.removeAlphaList(obj.id, groupname);
        }
    };
    GroupMgr.prototype.removeAlphaList = function(id, name) {
        var alpha = $.fisrtPinyin(name);
        var alphaList = this.alphaList[alpha];
        if (alphaList) {
            alphaList = _.without(alphaList, id);
            if (alphaList.length === 0) {
                delete this.alphaList[alpha];
            } else {
                this.alphaList[alpha] = alphaList;
            }
        }
    };
    GroupMgr.prototype.updateGroup = function(obj) {
        this.list[obj.id].members = obj.members;
        if (obj.type != null) {
            this.list[obj.id].type = obj.type;
        }
        if (obj.name != null) {
            this.list[obj.id].name = obj.name;
        }
    };
    GroupMgr.prototype.addMembers = function(obj) {
        var list = this.list[obj.id].members;
        list.push(obj.userid);
    };
    GroupMgr.prototype.removeMembers = function(obj) {
        var list = this.list[obj.id].members;
        this.list[obj.id].members = _.without(list, obj.userid);
    };
    GroupMgr.prototype.addList = function(list) {
        for (var i in list) {
            this.add(list[i]);
        }
        this.init = true;
    };
    GroupMgr.prototype.showGroupMessage = function(obj) {
        console.log('[',  obj.group,  obj.from, ']'+obj.msg);
    };
    GroupMgr.prototype.getGroupList = function(name, creators, members) {
        app.showWait();
        var obj = {};
        if (name) {
            obj.name = name;
        }
        if (creators&&creators.length) {
            obj.creators = creators;
        }
        if (members&&members.length) {
            obj.members = members;
        }
        app.emit('GROUP_LIST_RQ', obj);
    };
    GroupMgr.prototype.onGetGroupList = function(groups) {
        this.emitEvent({type:"ON_GET_GROUP_LIST", groups: groups});
    };
    GroupMgr.prototype.getGroupInfo = function(groupid) {
        app.emit('GROUP_INFO_RQ', {id: groupid});
    };
    GroupMgr.prototype.onGetGroupInfo = function(obj) {
        if (obj) {
            console.log(obj);
        } else {
            console.error("there is no group");
        }
    };
    GroupMgr.prototype.createGroup = function(name, members, type) {
        type = type&&1||0;
        app.emit('GROUP_CREATE_RQ', {name:name, members:members, type:type});
    };
    GroupMgr.prototype.onCreateGroup = function(obj) {
        console.log(obj);
        if (obj.error) {
            console.error("create "+obj.name+" failed: for "+obj.error);
        } else {
            this.add({id:obj.id, name:obj.name, creator:app.loginMgr.userid, type:obj.type, members:obj.members});
            console.log("create "+obj.name+" success");
        }
        this.emitEvent({type:"ON_CREATE_GROUP", error: obj.error});
    };
    GroupMgr.prototype.modifyGroup = function(id, name, members, type) {
        type = type&&1||0;
        app.emit('GROUP_MODIFY_RQ', {id:id, name:name, members:members, type:type});
    };
    GroupMgr.prototype.onModifyGroup = function(obj) {
        if (obj.error) {
            console.error("modify "+obj.id+" failed: for "+obj.error);
        } else {
            this.list[obj.id].members = obj.members;
            this.list[obj.id].type = obj.type;
            this.list[obj.id].name = obj.name;
            console.log("modify "+obj.id+" success");
        }
        this.emitEvent({type:"ON_MODIFY_GROUP", error: obj.error});
    };
    GroupMgr.prototype.removeGroup = function(id) {
        app.emit('GROUP_DELETE_RQ', {id:id});
    };
    GroupMgr.prototype.onRemoveGroup = function(obj) {
        if (obj.error) {
            console.error("remove "+obj.id+" failed: for "+obj.error);
        } else {
            this.remove(obj);
            console.log("remove "+obj.id+" success");
        }
        this.emitEvent({type:"ON_REMOVE_GROUP", error: obj.error});
    };
    GroupMgr.prototype.onRemoveGroupNotify = function(obj) {
        this.remove(obj);
        console.log( obj.id, 'is been delete');
        this.emitEvent({type:"ON_GROUP_LIST_CHANGE"});
    };
    GroupMgr.prototype.joinGroup = function(id) {
        app.emit('GROUP_JOIN_RQ', {id:id});
    };
    GroupMgr.prototype.onJoinGroup = function(obj) {
        if (obj.error) {
            console.error("join "+obj.id+" failed: for "+obj.error);
        } else {
            this.add({id:obj.id, name:obj.name, creator:obj.creator, type:obj.type, members:obj.members});
            console.log("join "+obj.id+" success");
        }
        this.emitEvent({type:"ON_JOIN_GROUP", error: obj.error});
    };
    GroupMgr.prototype.onJoinGroupNotify = function(obj) {
        this.addMembers({id:obj.id, userid:obj.userid});
        console.log( obj.userid, 'join group',  obj.id);
        this.emitEvent({type:"ON_UPDATE_GROUP", id:obj.id});
    };
    GroupMgr.prototype.leaveGroup = function(id) {
        app.emit('GROUP_LEAVE_RQ', {id:id});
    };
    GroupMgr.prototype.onLeaveGroup = function(obj) {
        this.remove(obj);
        console.log("leave "+obj.id+" success");
        this.emitEvent({type:"ON_LEAVE_GROUP"});
    };
    GroupMgr.prototype.onLeaveGroupNotify = function(obj) {
        this.removeMembers({id:obj.id, userid:obj.userid});
        console.log( obj.userid, 'lest group',  obj.id);
        this.emitEvent({type:"ON_UPDATE_GROUP", id:obj.id});
    };
    GroupMgr.prototype.pullInGroup = function(id, members) {
        app.emit('GROUP_PULL_IN_RQ', {id:id, members:members});
    };
    GroupMgr.prototype.onPullInGroup = function(obj) {
        if (obj.error) {
            console.error("pull "+obj.id+" failed: for "+obj.error);
        } else {
            this.updateGroup({id:obj.id, members:obj.members});
            console.log("pull "+obj.id+" success");
        }
    };
    GroupMgr.prototype.onPullInGroupNotify = function(obj) {
        if (_.contains(obj.pulledmembers, app.loginMgr.userid)) {
            this.add({id:obj.id, name:obj.name, creator:obj.creator, type:obj.type, members:obj.members});
            console.log('you have been pull',  obj.id);
            this.emitEvent({type:"ON_GROUP_LIST_CHANGE"});
        } else {
            this.updateGroup({id:obj.id, members:obj.members, type:obj.type, name:obj.name});
            if (obj.pulledmembers.length) {
                console.log(JSON.stringify(obj.pulledmembers), 'been pull', obj.id, obj.members);
            } else {
                console.log(obj.id, 'been modify', 'type='+obj.type);
            }
            this.emitEvent({type:"ON_UPDATE_GROUP", id:obj.id});
        }
    };
    GroupMgr.prototype.fireOutGroup = function(id, members) {
        app.emit('GROUP_FIRE_OUT_RQ', {id:id, members:members});
    };
    GroupMgr.prototype.onFireOutGroup = function(obj) {
        if (obj.error) {
            console.error("fireOut "+obj.id+" failed: for "+obj.error);
        } else {
            this.updateGroup({id:obj.id, members:obj.members});
            console.log("fireOut "+obj.id+" success");
        }
    };
    GroupMgr.prototype.onFireOutGroupNotify = function(obj) {
        if (_.contains(obj.firedmembers, app.loginMgr.userid)) {
            this.remove(obj);
            console.log('you have been fire',  obj.id);
            this.emitEvent({type:"ON_GROUP_LIST_CHANGE"});
            this.emitEvent({type:"ON_FIRE_OUT_GROUP", id:obj.id});
            app.messageMgr.removeLeftGroupMessages(obj.id);
        } else {
            this.updateGroup({id:obj.id, members:obj.members, type:obj.type, name:obj.name});
            console.log(JSON.stringify(obj.firedmembers), 'been fire', obj.id);
            this.emitEvent({type:"ON_UPDATE_GROUP", id:obj.id});
        }
    };

    return new GroupMgr();
})();


