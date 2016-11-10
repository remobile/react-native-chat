'use strict';
var ReactNative = require('react-native');
var {
    AsyncStorage,
} = ReactNative;
var EventEmitter = require('EventEmitter');
var fisrtPinyin = require('../../utils/pinyin');

class Manager extends EventEmitter {
    constructor() {
        super();
        this.reset();
    }
    emitGroupEvent(data) {
        this.emit("GROUP_EVENT", data);
    }
    addGroupEventListener(target) {
        target.addListenerOn(this, "GROUP_EVENT", target.onGroupEventListener);
    }
    reset() {
        this.list = {};
        this.alphaList = {};
        this.init = false;
    }
    add(obj, noupdate) {
        let {id} = obj,
        list = this.list;
        if(!list.hasOwnProperty(id)) {
            list[id] = obj;
            this.addAlphaList(id, obj.name);
        }
    }
    addAlphaList(id, name) {
        var alpha = fisrtPinyin(name);
        var alphaList = this.alphaList;
        alphaList[alpha] = alphaList[alpha]||[];
        alphaList[alpha].push(id);
    }
    remove(id) {
        if(this.list.hasOwnProperty(id)) {
            var groupname = this.list[id].name;
            delete this.list[id];
            this.removeAlphaList(id, groupname);
        }
    }
    removeAlphaList(id, name) {
        var alpha = fisrtPinyin(name);
        var alphaList = this.alphaList[alpha];
        if (alphaList) {
            alphaList = _.without(alphaList, id);
            if (alphaList.length === 0) {
                delete this.alphaList[alpha];
            } else {
                this.alphaList[alpha] = alphaList;
            }
        }
    }
    updateGroup(obj) {
        let {id, name, type, members} = obj;
        this.list[id].members = members;
        if (type != null) {
            this.list[id].type = type;
        }
        if (name != null) {
            this.list[id].name = name;
        }
    }
    addMembers(obj) {
        var list = this.list[obj.id].members;
        list.push(obj.userid);
    }
    removeMembers(obj) {
        var list = this.list[obj.id].members;
        this.list[obj.id].members = _.without(list, obj.userid);
    }
    addList(list) {
        for (var item of list) {
            this.add(item);
        }
        this.init = true;
    }
    getGroupList(name, creators, members) {
        app.showWait();
        app.emit('GROUP_LIST_RQ', {name, creators, members});
    }
    onGetGroupList(groups) {
        this.emitGroupEvent({type:"ON_GET_GROUP_LIST", groups: groups});
    }
    getGroupInfo(groupid) {
        app.emit('GROUP_INFO_RQ', {id: groupid});
    }
    onGetGroupInfo(obj) {
        if (obj) {
            console.log(obj);
        } else {
            console.log("there is no group");
        }
    }
    createGroup(name, members, type) {
        app.emit('GROUP_CREATE_RQ', {name, members, type});
    }
    onCreateGroup(obj) {
        let {error, id, name, type, members} = obj;
        if (error) {
            console.log("create "+name+" failed: for "+error);
        } else {
            this.add({id, name, creator:app.loginMgr.userid, type, members});
            console.log("create "+name+" success");
        }
        this.emitGroupEvent({type:"ON_CREATE_GROUP", error});
    }
    modifyGroup(id, name, members, type) {
        app.emit('GROUP_MODIFY_RQ', {id, name, members, type});
    }
    onModifyGroup(obj) {
        let {error, id, name, type, members} = obj;
        if (error) {
            console.log("modify "+id+" failed: for "+error);
        } else {
            Object.assign(this.list[id], {members, type, name});
            console.log("modify "+id+" success");
        }
        this.emitGroupEvent({type:"ON_MODIFY_GROUP", error});
    }
    removeGroup(id) {
        app.emit('GROUP_DELETE_RQ', {id:id});
    }
    onRemoveGroup(obj) {
        let {error, id} = obj;
        if (error) {
            console.log("remove "+id+" failed: for "+error);
        } else {
            this.remove(id);
            console.log("remove "+id+" success");
        }
        this.emitGroupEvent({type:"ON_REMOVE_GROUP", error});
    }
    onRemoveGroupNotify(obj) {
        let {id} = obj;
        this.remove(id);
        console.log(id, 'is been delete');
        this.emitGroupEvent({type:"ON_GROUP_LIST_CHANGE"});
    }
    joinGroup(id) {
        app.emit('GROUP_JOIN_RQ', {id});
    }
    onJoinGroup(obj) {
        let {error, id, name, creator, type, members} = obj;
        if (error) {
            console.log("join "+id+" failed: for "+error);
        } else {
            this.add({id, name, creator, type, members});
            console.log("join "+id+" success");
        }
        this.emitGroupEvent({type:"ON_JOIN_GROUP", error});
    }
    onJoinGroupNotify(obj) {
        let {id, userid} = obj;
        this.addMembers({id, userid});
        console.log(userid, 'join group', id);
        this.emitGroupEvent({type:"ON_UPDATE_GROUP", id});
    }
    leaveGroup(id) {
        app.emit('GROUP_LEAVE_RQ', {id});
    }
    onLeaveGroup(obj) {
        let {id} = obj;
        this.remove(id);
        console.log("leave "+id+" success");
        this.emitGroupEvent({type:"ON_LEAVE_GROUP"});
    }
    onLeaveGroupNotify(obj) {
        let {id, userid} = obj;
        this.removeMembers({id, userid});
        console.log(userid, 'lest group', id);
        this.emitGroupEvent({type:"ON_UPDATE_GROUP", id});
    }
    pullInGroup(id, members) {
        app.emit('GROUP_PULL_IN_RQ', {id, members});
    }
    onPullInGroup(obj) {
        let {error, id, members} = obj;
        if (error) {
            console.log("pull "+id+" failed: for "+error);
        } else {
            this.updateGroup({id, members});
            console.log("pull "+id+" success");
        }
    }
    onPullInGroupNotify(obj) {
        let {pulledmembers, id, name, creator, type, members} = obj;
        if (_.contains(pulledmembers, app.loginMgr.userid)) {
            this.add({id, name, creator, type, members});
            console.log('you have been pull', id);
            this.emitGroupEvent({type:"ON_GROUP_LIST_CHANGE"});
        } else {
            this.updateGroup({id, members, type, name});
            if (pulledmembers.length) {
                console.log(JSON.stringify(pulledmembers), 'been pull', id, members);
            } else {
                console.log(id, 'been modify', 'type='+type);
            }
            this.emitGroupEvent({type:"ON_UPDATE_GROUP", id});
        }
    }
    fireOutGroup(id, members) {
        app.emit('GROUP_FIRE_OUT_RQ', {id, members});
    }
    onFireOutGroup(obj) {
        let {error, id, members} = obj;
        if (error) {
            console.log("fireOut "+id+" failed: for "+error);
        } else {
            this.updateGroup({id, members});
            console.log("fireOut "+id+" success");
        }
    }
    onFireOutGroupNotify(obj) {
        let {pulledfiredmembersmembers, id, name, creator, type, members} = obj;
        if (_.contains(firedmembers, app.loginMgr.userid)) {
            this.remove(id);
            console.log('you have been fire',  id);
            this.emitGroupEvent({type:"ON_GROUP_LIST_CHANGE"});
            this.emitGroupEvent({type:"ON_FIRE_OUT_GROUP", id});
            app.messageMgr.removeLeftGroupMessages(id);
        } else {
            this.updateGroup({id, members, type, name});
            console.log(JSON.stringify(firedmembers), 'been fire', id);
            this.emitGroupEvent({type:"ON_UPDATE_GROUP", id});
        }
    }
}
module.exports = new Manager();
