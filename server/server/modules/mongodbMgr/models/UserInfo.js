module.exports = (function() {
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema;

    var UserInfoSchema = Schema({
        userid: {type:String, unique:true, required: true},
        head: {type:String}
    }, {
        collection: 'userinfos'
    });

    UserInfoSchema.statics._update = function(userid, head, callback) {
        this.findOneAndUpdate({userid:userid}, {head:head}, {upsert:true}, function(err, doc) {
            callback();
        });
    };
    UserInfoSchema.statics._get = function(users, callback) {
        this.find({userid:{$in:users}}, '-_id -__v', function(err, docs){
            callback(docs);
        });
    };

    return mongoose.model('UserInfo', UserInfoSchema);
})();


