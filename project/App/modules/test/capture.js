'use strict';

var React = require('react');
var ReactNative = require('react-native');

var {
    StyleSheet,
    View,
    Text,
    Image,
} = ReactNative;

var SplashScreen = require('@remobile/react-native-splashscreen');
var Button = require('@remobile/react-native-simple-button');
var Capture = require('@remobile/react-native-capture');
var fs = require('react-native-fs');

module.exports = React.createClass({
    componentDidMount() {
        SplashScreen.hide();
    },
    doCapture() {
        fs.downloadFile({fromUrl:'http://localhost:8888/1.png', toFile:'//Users/fang/rn/1.png'}).promise.then(async (res)=>{
            console.log(res);
        }).catch(
            (err)=>{
                console.log(err);
            }
        );
    },
    render() {
        return (
            <View style={styles.container}>
                <Button onPress={this.doCapture}>采集</Button>
            </View>
        );
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
});
