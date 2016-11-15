'use strict';

var React = require('react');
var ReactNative = require('react-native');
var {
    StyleSheet,
    View,
} = ReactNative;

var SplashScreen = require('@remobile/react-native-splashscreen');
var CacheImage = require('@remobile/react-native-cache-image');

var CacheImageIdMgr = {
    CACHE_ID_USER_HEAD: 0,
    CACHE_ID_USER_HEAD1: 1,
    CACHE_ID_USER_HEAD2: 2,
};

var SERVER = 'http://localhost:3000/images/';

module.exports = React.createClass({
    componentWillMount() {
        SplashScreen.hide();
    },
    render: function() {
        return (
            <View style={styles.container}>
                <CacheImage
                    resizeMode='stretch'
                    defaultImage={app.img.personal_default_head}
                    url={SERVER+"1.png"}
                    style={styles.image}
                    cacheId={CacheImageIdMgr.CACHE_ID_USER_HEAD}
                    />
                <CacheImage
                    resizeMode='stretch'
                    defaultImage={app.img.personal_default_head}
                    url={SERVER+"1.png"}
                    style={styles.image}
                    cacheId={CacheImageIdMgr.CACHE_ID_USER_HEAD}
                    />
                <CacheImage
                    resizeMode='stretch'
                    defaultImage={app.img.personal_default_head}
                    url={SERVER+"2.png"}
                    style={styles.image}
                    cacheId={CacheImageIdMgr.CACHE_ID_USER_HEAD1}
                    />
            </View>
        );
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    image: {
        width:200,
        height:200,
    }
});
