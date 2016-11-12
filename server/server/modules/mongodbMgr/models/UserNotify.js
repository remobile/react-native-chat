module.exports = (function() {
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema;

    var UserNotifySchema = Schema({
        userid: {type:String, unique:true, required: true},
        notice: {type:Array, default:[]} /*[userid, userid]*/
    }, {
         collection: 'usernotifies'
    });

    UserNotifySchema.statics._get = function(userid, callback) {
        this.findOne({userid:userid}, '-_id -__v', function(err, doc){
            callback(doc);
        });
    };
    UserNotifySchema.statics._init = function(userid, callback) {
        var that = this;
        this.findOneAndUpdate({userid:userid}, {}, {upsert:true}, function(){
            callback&&callback();
        });
    };
    UserNotifySchema.statics._add = function(type, users, userid) {
        this.find({userid:{$in:users}}, function(err, docs){
            _.map(docs, function(doc){
                if (doc.userid != userid) {
                    doc[type].addToSet(userid);
                    doc.save();
                }
            });
        });
    };
    UserNotifySchema.statics._clear = function(userid) {
        this.findOne({userid:userid},  function(err, doc){
            doc.head = [];
            doc.save();
        });
    };

    return mongoose.model('UserNotify', UserNotifySchema);
})();
