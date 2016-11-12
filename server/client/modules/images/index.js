module.exports = {
    getUserHead: function(cnt) {
        cnt = cnt % 33;
        return __dirname+'/'+cnt+'.jpg';
    }
};
