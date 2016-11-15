var fs = require('fs-extra');
var path = require('path');
var readline = require('readline');
var osHomedir = require('os-homedir');

var historyPath = path.join(osHomedir(), '.chat_repl_history');
var rl = readline.createInterface(process.stdin, process.stdout);
// rl.setPrompt('>');
fs.createFileSync(historyPath);
var history = fs.readFileSync(historyPath, "utf8").toString().split("\n").slice(0, -1).reverse();
var oldAddHistory = rl._addHistory;
rl._addHistory = function() {
    var last = rl.history[0];
    var line = oldAddHistory.call(rl);
    if (line.length > 0 && line != last) {
        fs.appendFileSync(historyPath, line + "\n");
    }
    return line;
}
if(rl.history instanceof Array){
    rl.history.push.apply(rl.history, history);
}
rl.on("close", function(){
    console.log('Goodbye!')
});

module.exports = rl;
