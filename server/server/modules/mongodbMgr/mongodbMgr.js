module.exports = (function() {
    var _self;
    var autoIncrement = require('mongoose-auto-increment');

    function MongodbMgr() {
        _self = this;
    }

    MongodbMgr.prototype.start = function(dburl, callback) {
        var mongoose = require('mongoose');
        var db = mongoose.connect(dburl).connection;
        autoIncrement.initialize(mongoose);
        db.once('open', function() {
            var modelsPath = __dirname+'/models/';
            _self.User = require(modelsPath+'User');
            _self.Logger = require(modelsPath+'Logger');
            _self.OfflineMessage = require(modelsPath+'OfflineMessage');
            _self.Message = require(modelsPath+'Message');
            _self.Group = require(modelsPath+'Group');
            _self.UserInfo = require(modelsPath+'UserInfo');
            _self.UserNotify = require(modelsPath+'UserNotify');
            console.log('mongo working');
            callback();
        }).on('error', function() {
            console.log('connect error');
        });
    }

    return new MongodbMgr();
})();


