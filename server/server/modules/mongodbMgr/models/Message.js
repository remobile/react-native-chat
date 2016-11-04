module.exports = (function() {
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema;

    var MessageSchema = Schema({
        from: {type:String, required: true},
        to: {type:String, required:true},
        time: {type:Date, default:Date.now},
        msg: {type:String, required:true},
        msgtype: {type:String, required:true},
        msgid: {type:Number, required:true},
        type: {type:String},
        groupid: {type:Number},
        touserid: {type:String}
    }, {
        collection: 'messages'
    });

    MessageSchema.statics._add = function(from, to, msg, msgtype, msgid, type, groupid, time, touserid) {
        var doc = this({from:from, to:to, msg:msg, msgtype:msgtype, msgid:msgid, type:type, groupid:groupid, time:time, touserid:touserid});
        doc.save();
    };
    MessageSchema.statics._getByUser = function(userid1, userid2, time, cnt, callback) {
        console.log(userid1, userid2, time, cnt);
        this.find({time:{$lt:time}, type:app.messageMgr.USER_TYPE})
        .select('-_id -__v')
        .sort({time:-1})
        .or([{to:userid1, from:userid2}, {to:userid2, from:userid1}])
        .limit(cnt)
        .exec(function(err, docs){
            callback(docs);
        });
    };
    MessageSchema.statics._getByGroup = function(userid, groupid, time, cnt, callback) {
        this.find({time:{$lt:time}})
        .select('-_id -__v')
        .sort({time:-1})
        .or([{groupid:groupid, from:userid}, {groupid:groupid, to:userid}])
        .limit(cnt)
        .exec(function(err, docs){
            callback(docs);
        });
    };

    return mongoose.model('Message', MessageSchema);
})();


