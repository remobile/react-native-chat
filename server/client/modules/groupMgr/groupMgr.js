module.exports = define(function(require) {
    var _self;

    function GroupMgr() {
        _self = this;
        this.reset();
    }

    GroupMgr.prototype.reset = function() {
        this.list = {};
        this.init = false;
    };
    GroupMgr.prototype.add = function(obj) {
        var id = obj.id,
        list = _self.list;
        if(!list.hasOwnProperty(id)) {
            list[id] = obj;
        } else {
            app.console.error(id +" has multi");
        }
    };
    GroupMgr.prototype.remove = function(obj) {
        if(_self.list.hasOwnProperty(obj.id)) {
            delete _self.list[obj.id];
        }
    };
    GroupMgr.prototype.updateMembers = function(obj) {
         _self.list[obj.id].members = obj.members;
         if (obj.type != null) {
            _self.list[obj.id].type = obj.type;
         }
    };
    GroupMgr.prototype.addMembers = function(obj) {
         var list = _self.list[obj.id].members;
         list.push(obj.userid);
    };
    GroupMgr.prototype.removeMembers = function(obj) {
         var list = _self.list[obj.id].members;
         _self.list[obj.id].members = _.without(list, obj.userid);
    };
    GroupMgr.prototype.addList = function(list) {
        for (var i in list) {
            _self.add(list[i]);
        }
    };
    GroupMgr.prototype.getGroupList = function(name, creators, members) {
        var obj = {};
        if (name) {
            obj.name = name;
        }
        if (creators) {
            obj.creators = creators;
        }
        if (members) {
            obj.members = members;
        }
        app.socket.emit('GROUP_LIST_RQ', obj);
    };
    GroupMgr.prototype.onGetGroupList = function(obj) {
        var len = obj.length;
        if (!len) {
            app.console.error("there is no group");
        } else {
            for (var i=0,len=obj.length; i<len; i++) {
                app.console.log(obj[i]);
            }
        }
    };
    GroupMgr.prototype.getGroupInfo = function(groupid) {
        app.socket.emit('GROUP_INFO_RQ', {id: groupid});
    };
    GroupMgr.prototype.onGetGroupInfo = function(obj) {
        if (obj) {
            app.console.log(obj);
        } else {
            app.console.error("there is no group");
        }
    };
    GroupMgr.prototype.createGroup = function(name, members, type) {
        type = type&&1||0;
        app.socket.emit('GROUP_CREATE_RQ', {name:name, members:members, type:type});
    };
    GroupMgr.prototype.onCreateGroup = function(obj) {
        if (obj.error) {
            app.console.error("create "+obj.name+" failed: for "+app.error[obj.error]);
        } else {
            _self.add({id:obj.id, name:obj.name, creator:app.login.userid, type:obj.type, members:obj.members});
            app.console.success("group create "+obj.id+"==>:"+obj.name+" success");
        }
    };
    GroupMgr.prototype.modifyGroup = function(id, name, members, type) {
        app.socket.emit('GROUP_MODIFY_RQ', {id:id, name:name, members:members, type:type});
    };
    GroupMgr.prototype.onModifyGroup = function(obj) {
        if (obj.error) {
            app.console.error("modify "+obj.id+" failed: for "+app.error[obj.error]);
        } else {
            _self.list[obj.id].members = obj.members;
            _self.list[obj.id].type = obj.type;
            _self.list[obj.id].name = obj.name;
            app.console.success("modify "+obj.id+"==>:"+obj.name+" success");
        }
    };
    GroupMgr.prototype.removeGroup = function(id) {
        app.socket.emit('GROUP_DELETE_RQ', {id:id});
    };
    GroupMgr.prototype.onRemoveGroup = function(obj) {
        if (obj.error) {
            app.console.error("remove "+obj.id+" failed: for "+app.error[obj.error]);
        } else {
            _self.remove(obj);
            app.console.success("remove "+obj.id+" success");
        }
    };
    GroupMgr.prototype.onRemoveGroupNotify = function(obj) {
        _self.remove(obj);
        app.console.log('blue@'+obj.id, 'is been delete');
    };
    GroupMgr.prototype.joinGroup = function(id) {
        app.socket.emit('GROUP_JOIN_RQ', {id:id});
    };
    GroupMgr.prototype.onJoinGroup = function(obj) {
        if (obj.error) {
            app.console.error("join "+obj.id+" failed: for "+app.error[obj.error]);
        } else {
            _self.add({id:obj.id, name:obj.name, creator:obj.creator, type:obj.type, members:obj.members});
            app.console.success("join "+obj.id+" success");
        }
    };
    GroupMgr.prototype.onJoinGroupNotify = function(obj) {
        _self.addMembers({id:obj.id, userid:obj.userid});
        app.console.log('red@'+obj.userid, 'join group', 'blue@'+obj.id);
    };
    GroupMgr.prototype.leaveGroup = function(id) {
        app.socket.emit('GROUP_LEAVE_RQ', {id:id});
    };
    GroupMgr.prototype.onLeaveGroup = function(obj) {
        _self.remove(obj);
        app.console.success("leave "+obj.id+" success");
    };
    GroupMgr.prototype.onLeaveGroupNotify = function(obj) {
        _self.removeMembers({id:obj.id, userid:obj.userid});
        app.console.log('red@'+obj.userid, 'lest group', 'blue@'+obj.id);
    };
    GroupMgr.prototype.pullInGroup = function(id, members) {
        members = members.split(',');
        app.socket.emit('GROUP_PULL_IN_RQ', {id:id, members:members});
    };
    GroupMgr.prototype.onPullInGroup = function(obj) {
        if (obj.error) {
            app.console.error("pull "+obj.id+" failed: for "+app.error[obj.error]);
        } else {
            _self.updateMembers({id:obj.id, members:obj.members});
            app.console.success("pull "+obj.id+" success");
        }
    };
    GroupMgr.prototype.onPullInGroupNotify = function(obj) {
        if (_.contains(obj.pulledmembers, app.login.userid)) {
            _self.add({id:obj.id, name:obj.name, creator:obj.creator, type:obj.type, members:obj.members});
            app.console.log('you have been pull', 'blue@'+obj.id);
        } else {
            _self.updateMembers({id:obj.id, members:obj.members, type:obj.type});
            if (obj.pulledmembers.length) {
                app.console.log('red@'+JSON.stringify(obj.pulledmembers), 'been pull', 'blue@'+obj.id, obj.members);
            } else {
                app.console.log('red@'+obj.id, 'been modify', 'type='+obj.type);
            }
        }
    };
    GroupMgr.prototype.fireOutGroup = function(id, members) {
        app.socket.emit('GROUP_FIRE_OUT_RQ', {id:id, members:members});
    };
    GroupMgr.prototype.onFireOutGroup = function(obj) {
        if (obj.error) {
            app.console.error("fireOut "+obj.id+" failed: for "+app.error[obj.error]);
        } else {
            _self.updateMembers({id:obj.id, members:obj.members});
            app.console.success("fireOut "+obj.id+" success");
        }
    };
    GroupMgr.prototype.onFireOutGroupNotify = function(obj) {
        if (_.contains(obj.firedmembers, app.login.userid)) {
            _self.remove(obj);
            app.console.log('you have been fire', 'blue@'+obj.id);
        } else {
            _self.updateMembers({id:obj.id, members:obj.members});
            app.console.log('red@'+JSON.stringify(obj.firedmembers), 'been fire', 'blue@'+obj.id, obj.members);
        }
    };

    return new GroupMgr();
});
