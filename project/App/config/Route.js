'use strict';

const {SERVER, BASE_SERVER} = CONSTANTS;

module.exports = {
    //用户
    ROUTE_USER_HEAD:(id)=>SERVER+'getUserHead?id='+id, //用户头像

    //网页地址
    ROUTE_USER_PROTOCOL: BASE_SERVER+'helper/protocal.html', //用户协议
    ROUTE_SOFTWARE_LICENSE: BASE_SERVER+'helper/protocal.html',//获取软件许可协议
    ROUTE_ABOUT_PAGE: BASE_SERVER+'helper/about.html', //关于

    //下载更新
    ROUTE_VERSION_INFO_URL: BASE_SERVER+"download/version.json",//版本信息地址
    ROUTE_JS_ANDROID_URL: BASE_SERVER+"download/jsandroid.zip",//android jsbundle 包地址
    ROUTE_JS_IOS_URL: BASE_SERVER+"download/jsios.zip",//ios jsbundle 包地址
    ROUTE_APK_URL: BASE_SERVER+"download/yxjqd.apk", //apk地址img/default_user_head.png
};
