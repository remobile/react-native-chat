module.exports = (function() {
    var colors = require('colors/safe'),
        _self;

    function Console() {
        _self = this;
    }

    Console.prototype.print = function(msg, color) {
        if (color) {
            _self.color = color;
        } else {
            color = _self.color;
        }
        msg = colors[color](msg);
        console.log(msg);
    };
    Console.prototype.log = function(msg) {
        var str = [];
        for (var i in arguments) {
            var item = arguments[i],
                info,
                color = 'green';
            if (/^[a-z]+@/.test(item)) {
                color = item.replace(/^([a-z]+)@.*/, '$1');
                info = item.replace(/^[a-z]+@/, '');
            } else {
                if (typeof item  == 'object') {
                    info  = JSON.stringify(item);
                } else {
                    info = item;
                }
            }
            str.push(colors[color](info));
        }
        console.log(str.join(' '));
    };
    Console.prototype.color = function(msg, color) {
        return colors[color](msg);
    };
    Console.prototype.success = function(msg) {
        _self.print(msg, 'green');
    };
    Console.prototype.error = function(error) {
        if (typeof error == 'object') {
            _self.print(error.info, 'red');
        } else {
            _self.print(error, 'red');
        }
    };
    Console.prototype.fatal = function(error) {
        _self.error(error);
        process.exit();
    };

    return new Console();
})();
