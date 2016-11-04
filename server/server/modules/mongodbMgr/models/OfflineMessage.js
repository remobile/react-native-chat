module.exports = (function() {
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema;

    var OfflineMessageSchema = Schema({
        from: {type:String, required: true},
        to: {type:String, required:true},
        time: {type:Date, default:Date.now},
        msg: {type:String, required:true},
        msgtype: {type:String, required:true},
        msgid: {type:Number, required:true},
        type: {type:String},
        group: {type:String},
        touserid: {type:String}
    }, {
        collection: 'offlinemessages'
    });

    OfflineMessageSchema.statics._add = function(from, to, msg, msgtype, msgid, type, group, time, touserid) {
        var doc = this({from:from, to:to, msg:msg, msgtype:msgtype, msgid:msgid, type:type, group:group, time:time, touserid:touserid});
        doc.save();
    };
    OfflineMessageSchema.statics._get = function(userid, callback) {
        this.find({to:userid})
        .select('-_id -__v')
        .exec(function(err, docs){
            callback(docs);
        });
    };
    OfflineMessageSchema.statics._remove = function(to, from, msgid) {
        var obj = {to:to};
        if (msgid) {
            obj.msgid = msgid;
        }
        if (from) {
            obj.from = from;
        }
        this.remove(obj, function(err){
            if (msgid) {
                console.log("[db]:remove temp message userid="+ to);
            } else {
                console.log("[db]:remove offline message userid="+ to);
            }
        });
    };

    return mongoose.model('OfflineMessage', OfflineMessageSchema);
})();


