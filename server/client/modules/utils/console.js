
var colors = require('colors/safe'),
readline = require('./readline.js'),
_self;

function Console() {
    _self = this;
}

Console.prototype.print = function(msg, color) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
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
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(str.join(' '));
    readline.prompt(true);
};
Console.prototype.color = function(msg, color) {
    return colors[color](msg);
};
Console.prototype.prompt = function() {
    readline.prompt(true);
};
Console.prototype.question = function(msg, callback) {
    readline.question(colors['blue'](msg), callback);
};
Console.prototype.success = function(msg) {
    _self.print(msg, 'green');
    _self.prompt();
};
Console.prototype.error = function(error) {
    if (app.error[error]) {
        _self.print(app.error[error], 'red');
    } else {
        _self.print(error, 'red');
    }
    _self.prompt();
};
Console.prototype.fatal = function(error) {
    _self.error(error);
    process.exit();
};

module.exports = new Console();
