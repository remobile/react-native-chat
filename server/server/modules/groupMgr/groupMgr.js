module.exports = (function() {
    var _self;
    function GroupMgr() {
        _self = this;
        _self.activeGroups = {};
    }

    GroupMgr.prototype.setActiveGroups = function(groupid, doc) {
        if (_self.activeGroups[groupid]) {
            _self.activeGroups[groupid] = doc;
        }
    };
    GroupMgr.prototype.getGroupList = function(socket, obj) {
        app.db.Group._getList(obj.id, obj.creators, obj.members, socket.userid, function(docs) {
            socket.emit('GROUP_LIST_RS', docs)
        });
    };
    GroupMgr.prototype.getGroupInfo = function(socket, obj) {
        app.db.Group._getInfo(obj.id, function(doc) {
            socket.emit('GROUP_INFO_RS', doc)
        });
    };
    GroupMgr.prototype.createGroup = function(socket, obj) {
        var members = obj.members;
        members.push(socket.userid);
        app.db.Group._create(obj.name, socket.userid, members, obj.type, function(err, doc) {
            if (!err) {
                app.db.User._joinGroup(members, doc.id);
                app.socketMgr.notifyOtherUsers(members, socket.userid, 'GROUP_PULL_IN_NF', {id:doc.id, name:obj.name, pulledmembers:_.without(members, socket.userid), creator:socket.userid, type:obj.type, members:members});
                socket.emit('GROUP_CREATE_RS', {error:null, id:doc.id, name:obj.name, type:obj.type, members:members});
            } else {
                socket.emit('GROUP_CREATE_RS', {error:err, name:obj.name});
            }
        });
    };
    GroupMgr.prototype.modifyGroup = function(socket, obj) {
        var members = obj.members;
        app.db.Group._modify(obj.id, obj.name, members, obj.type, function(err, doc, oldmembers) {
            if (!err) {
                var newadd = _.reject(members, function(userid){
                    return _.contains(oldmembers, userid);
                });
                var oldrm = _.reject(oldmembers, function(userid){
                    return _.contains(members, userid);
                });
                app.db.User._joinGroup(newadd, obj.id);
                app.db.User._leaveGroup(oldrm, obj.id);
                _self.setActiveGroups(obj.id, doc);

                app.socketMgr.notifyOtherUsers(doc.members, socket.userid, 'GROUP_PULL_IN_NF', {id:obj.id, name:obj.name, pulledmembers:newadd, creator:doc.creator, type:doc.type, members:doc.members});
                if (oldrm.length) {
                    app.socketMgr.notifyOtherUsers(oldmembers, socket.userid, 'GROUP_FIRE_OUT_NF', {id:obj.id, name:obj.name, firedmembers:oldrm, members:doc.members});
                }
                socket.emit('GROUP_MODIFY_RS', {error:null, id:obj.id, name:doc.name, type:doc.type, members:doc.members});
            } else {
                socket.emit('GROUP_MODIFY_RS', {error:err, id:obj.id});
            }
        });
    };
    GroupMgr.prototype.removeGroup = function(socket, obj) {
        var Group = app.db.Group;
        Group.findOne({id:obj.id}, function(err, doc) {
            if (!doc) {
                socket.emit('GROUP_DELETE_RS', {error:app.error.GROUP_NOT_EXIST, id:obj.id});
            } else {
                if (doc.creator != socket.userid) {
                    socket.emit('GROUP_DELETE_RS', {error:app.error.GROUP_NOT_CREATOR, id:obj.id});
                } else {
                    var members = doc.members;
                    app.db.User._leaveGroup(members, obj.id);
                    for (var i=0,len=members.length; i<len; i++) {
                        var client = app.onlineUserMgr.getClient(members[i]);
                        if (client && members[i]!=socket.userid) {
                            app.io.to(client.socketid).emit('GROUP_DELETE_NF', {id:obj.id});
                        }
                    }
                    Group._remove(obj.id, function() {
                        delete _self.activeGroups[obj.id];
                        socket.emit('GROUP_DELETE_RS', {id:obj.id});
                    });
                }
            }
        });
    };
    GroupMgr.prototype.getGroupUsers = function(groupid, callback) {
        var activeGroups = _self.activeGroups;
        if(!activeGroups.hasOwnProperty(groupid)) {
            app.db.Group._getInfo(groupid, function(doc) {
                _self.activeGroups[groupid] = doc;
                callback(doc.members);
            });
        } else {
            callback(_self.activeGroups[groupid].members);
        }
    };
    GroupMgr.prototype.joinGroup = function(socket, obj) {
        app.db.Group._join(obj.id, socket.userid, function(err, doc, oldmembers) {
            if (!err) {
                app.db.User._joinGroup([socket.userid], obj.id);
                _self.setActiveGroups(obj.id, doc);

                app.socketMgr.notifyOtherUsers(doc.members, socket.userid, 'GROUP_JOIN_NF', {id:obj.id, userid:socket.userid});
                socket.emit('GROUP_JOIN_RS', {error:null, id:obj.id, name:doc.name, creator:doc.creator, type:doc.type, members:doc.members});
            } else {
                socket.emit('GROUP_JOIN_RS', {error:err, id:obj.id});
            }
        });
    };
    GroupMgr.prototype.leaveGroup = function(socket, obj) {
        app.db.Group._leave(obj.id, socket.userid, function(doc) {
            app.db.User._leaveGroup([socket.userid], obj.id);
            _self.setActiveGroups(obj.id, doc);

            app.socketMgr.notifyOtherUsers(doc.members, socket.userid, 'GROUP_LEAVE_NF', {id:obj.id, userid:socket.userid});
            socket.emit('GROUP_LEAVE_RS', {id:obj.id});
        });
    };
    GroupMgr.prototype.pullInGroup = function(socket, obj) {
        var members = obj.members;
        app.db.Group._pullIn(obj.id, socket.userid, members, function(err, doc, oldmembers) {
            if (!err) {
                app.db.User._joinGroup(members, obj.id);
                _self.setActiveGroups(obj.id, doc);

                app.socketMgr.notifyOtherUsers(doc.members, socket.userid, 'GROUP_PULL_IN_NF', {id:obj.id, name:doc.name, pulledmembers:members, creator:doc.creator, type:doc.type, members:doc.members});
                socket.emit('GROUP_PULL_IN_RS', {error:null, id:obj.id, members:doc.members});
            } else {
                socket.emit('GROUP_PULL_IN_RS', {error:err, id:obj.id});
            }
        });
    };
    GroupMgr.prototype.fireOutGroup = function(socket, obj) {
        var members = obj.members.split(',');
        app.db.Group._fireOut(obj.id, socket.userid, members, function(err, doc, oldmembers) {
            if (!err) {
                app.db.User._leaveGroup(members, obj.id);
                _self.setActiveGroups(obj.id, doc);

                app.socketMgr.notifyOtherUsers(oldmembers, socket.userid, 'GROUP_FIRE_OUT_NF', {id:obj.id, name:doc.name, firedmembers:members, members:doc.members});
                socket.emit('GROUP_FIRE_OUT_RS', {error:null, id:obj.id, members:doc.members});
            } else {
                socket.emit('GROUP_FIRE_OUT_RS', {error:err, id:obj.id});
            }
        });
    };

    return new GroupMgr();
})();

