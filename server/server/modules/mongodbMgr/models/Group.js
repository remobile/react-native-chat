module.exports = (function() {
    var mongoose = require('mongoose'),
        autoIncrement = require('mongoose-auto-increment'),
        Schema = mongoose.Schema;

    var GroupSchema = Schema({
        name: {type:String, required: true},
        creator: {type:String, required: true},
        members: {type:Array, required:true},
        type: {type:Number, default:0}
    }, {
        collection: 'groups'
    });

    GroupSchema.plugin(autoIncrement.plugin, { model: 'Group', field: 'id' });

    GroupSchema.statics._create = function(name, creator, members, type, callback) {
        var group = this({name:name, creator:creator, members:members, type:type});
        group.save(function(err, doc){
            var error = null;
            if (err) {
                if (err.code == 11000) {
                    error = app.error.GROUP_NAME_DUPLICATE;
                } else {
                    error = app.error.UNKNOWN_ERROR;
                }
            }
            callback(error, doc);
        });
    };
    GroupSchema.statics._modify = function(id, name, members, type, callback) {
        this.findOne({id:id}, function(err, doc){
            if (doc) {
                var oldmembers = doc.members;
                doc.members = members;
                if (type != null) {
                    doc.type = type;
                }
                if (name != null) {
                    doc.name = name;
                }
                doc.save();
                callback(null, doc, oldmembers);
            } else {
                callback(app.error.GROUP_NOT_EXIST);
            }
        });
    };
    GroupSchema.statics._remove = function(id, callback) {
        this.remove({id:id}, function() {
            callback();
        });
    };
    GroupSchema.statics._getList = function(name, creators, members, selfid, callback) {
        var obj = {type: 0};
        if (name) {
            obj.name = new RegExp('.*'+name+'.*', 'i');
        }
        if (creators&&creators.length) {
            obj.creator = {$in: creators};
        }
        this.find(obj,'-_id -__v', function(err, docs) {
            var ret = [];
            if (!members||!members.length) {
                for (var i=0,len=docs.length; i<len; i++) {
                    var doc = docs[i];
                    if (!_.contains(doc.members, selfid)) {
                        ret.push(doc);
                    }
                }
            } else {
                for (var i=0,len=docs.length; i<len; i++) {
                    var doc = docs[i];
                    if (!_.contains(doc.members, selfid) && _.intersection(members, doc.members).length) {
                        ret.push(doc);
                    }
                }
            }
            callback(ret);
        });
    };
    GroupSchema.statics._getInfo = function(id, callback) {
        this.findOne({id:id}, '-_id -__v', function(err, doc) {
            callback(doc);
        });
    };
    GroupSchema.statics._join = function(id, userid, callback) {
        this.findOne({id:id}, function(err, doc){
            if (doc) {
                var members = doc.members;
                var oldmembers = _.union(members, null);
                if (members.indexOf(userid) == -1) {
                    members.push(userid);
                    doc.members = members;
                    doc.save();
                    callback(null, doc, oldmembers);
                } else {
                    callback(app.error.GROUP_JOIN_MORE_TIMES);
                }
            } else {
                callback(app.error.GROUP_NOT_EXIST);
            }
        });
    };
    GroupSchema.statics._leave = function(id, userid, callback) {
        var update = {$pull:{members:userid}};
        this.findOneAndUpdate({id:id}, update, function(err, doc) {
            callback(doc);
        });
    };
    GroupSchema.statics._pullIn = function(id, userid, members, callback) {
        this.findOne({id:id, creator:userid}, function(err, doc) {
            if (!doc) {
                callback(app.error.GROUP_NOT_CREATOR);
            } else {
                var oldmembers = doc.members;
                doc.members = _.union(doc.members, members);
                doc.save();
                callback(null, doc, oldmembers);
            }
        });
    };
    GroupSchema.statics._fireOut = function(id, userid, members, callback) {
        this.findOne({id:id, creator:userid}, function(err, doc) {
            if (!doc) {
                callback(app.error.GROUP_NOT_CREATOR);
            } else {
                var oldmembers = doc.members;
                doc.members = _.difference(doc.members, members);
                doc.save();
                callback(null, doc, oldmembers);
            }
        });
    };

    return mongoose.model('Group', GroupSchema);
})();


