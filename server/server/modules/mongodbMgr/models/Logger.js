module.exports = (function() {
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema;

    var LoggerSchema = Schema({
        type: {type:String, required: true},
        from: {type:String, required: true},
        to: {type:String},
        time: {type:Date, default:Date.now},
        content: {type:String}
    }, {
        collection: 'loggers'
    });

    LoggerSchema.statics._logMessage = function(from, to, msg, time) {
        var log = this({type:'message', from:from, to:to, content:msg, time:time});
        log.save();
    };

    LoggerSchema.statics._logEvent = function(type, from) {
        var log = this({type:type, from:from});
        log.save();
    };

    return mongoose.model('Logger', LoggerSchema);
})();


