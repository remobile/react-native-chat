var moment = require('moment');

moment.locale('zh-cn', {
    monthsShort : '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
    weekdaysShort : '周日_周一_周二_周三_周四_周五_周六'.split('_'),
    meridiem : function (hour, minute, isLower) {
        var hm = hour * 100 + minute;
        if (hm < 600) {
            return '凌晨';
        } else if (hm < 900) {
            return '早上';
        } else if (hm < 1130) {
            return '上午';
        } else if (hm < 1230) {
            return '中午';
        } else if (hm < 1800) {
            return '下午';
        } else {
            return '晚上';
        }
    },
});

module.exports = (time) => {
    let now = moment(), date = moment(time);
    if (now.isSame(date, 'day')) {
        return date.format('A HH:mm');
    } else if (now.startOf('day').diff(date.startOf('day'), 'day') == 1) {
        return date.format('昨天 A HH:mm');
    } else if (now.isSame(date, 'week')) {
        return date.format('ddd A HH:mm');
    }
    return date.format('MMMD日 A HH:mm');
};
