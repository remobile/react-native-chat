const strChineseFirstPY = require('../../data/pinyin.js');
module.exports =  function(ch) {
    var uni = ch.charCodeAt(0);
    if (uni >= 48 && uni <= 57) {
        return "1";
    }
    if (uni >= 65 && uni <=90) {
        return uni;
    }
    if (uni >= 97 && uni <=122) {
        return String.fromCharCode(uni-32);
    }
    if (uni > 40869 || uni < 19968)
    return "#";
    return strChineseFirstPY.charAt(uni - 19968);
};
