'use strict';

var React = require('react');var ReactNative = require('react-native');
var {
    Image,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TouchableHighlight,
} = ReactNative;

var EditPersonInfo = require('./EditPersonInfo.js');
var Settings = require('./Settings');
var Store = require('./Store.js');

var {Button, DImage, WebviewMessageBox} = COMPONENTS;

const CHILD_PAGES = [
    {seprator:true, title:'设置', module: Settings, img:app.img.personal_settings, info:''},
    {hidden:false, seprator:true, title:'查看存储', module: Store, img:app.img.personal_settings, info:''},
];


var MenuItem = React.createClass({
    showChildPage() {
        const {module} = this.props.page;
        app.navigator.push({
            component: this.props.page.module,
        });
    },
    render() {
        const {title, img, info, seprator} = this.props.page;
        return (
            <TouchableOpacity
                activeOpacity={0.6}
                onPress={this.showChildPage}
                style={seprator ? styles.ItemBg2 : styles.ItemBg}>
                <View style={styles.infoStyle}>
                    <Image
                        resizeMode='stretch'
                        source={img}
                        style={styles.icon_item}  />
                    <Text style={styles.itemNameText}>{title}</Text>
                    <Text style={styles.itemNoticeText}>{info}</Text>
                </View>
                <Image
                    resizeMode='stretch'
                    source={app.img.common_go}
                    style={styles.icon_go}  />
            </TouchableOpacity>
        )
    }
});

module.exports = React.createClass({
    statics: {
        title: '个人中心',
    },
    doExit() {
        app.navigator.resetTo({
            title: '登录'+CONSTANTS.APP_NAME,
            component: require('../login/Login.js'),
        }, 0);
        app.personal.clear();
    },
    showEditPersonInfo() {

    },
    render() {
        const {userid} = app.loginMgr;
        const {username} = app.userMgr.users[userid]||{};
        return (
            <View style={styles.container}>
                <TouchableHighlight underlayColor="#CFCFCF" onPress={this.showEditPersonInfo}>
                    <View style={styles.infoContainer}>
                        <Image
                            resizeMode='stretch'
                            source={app.img.personal_default_head}
                            style={styles.avatar} />
                        <View style={styles.nameContainer}>
                            <Text style={styles.name}>{username}</Text>
                            <Text style={styles.phone}>{userid}</Text>
                        </View>
                    </View>
                </TouchableHighlight>
                {
                    CHILD_PAGES.map((item, i)=>{
                        return (
                            !item.hidden&&
                            <MenuItem page={item} key={i}/>
                        )
                    })
                }
            </View>
        );
    }
});

var styles = StyleSheet.create({
    container: {
        flex:1,
        paddingTop: 20,
        backgroundColor: '#ececec',
    },
    infoContainer: {
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    avatar: {
        width: 80,
        height: 80,
        marginLeft: 20,
    },
    nameContainer: {
        flex: 1,
        height: 80,
        paddingLeft: 20,
        justifyContent: 'center',
    },
    name: {
        fontSize: 18,
        marginBottom: 5,
    },
    phone: {
        fontSize: 14,
        marginTop: 5,
        color: 'gray',
    },
    ItemBg2: {
        marginTop: 20,
        padding: 10,
        height: 45,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
    },
    ItemBg: {
        marginTop: 1,
        padding: 10,
        height: 45,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
    },
    icon_go: {
        alignSelf: 'flex-end',
        width: 8,
        height: 15,
    },
    infoStyle: {
        flex: 3,
        flexDirection: 'row',
        alignSelf: 'flex-start',
    },
    icon_item: {
        width: 25,
        height: 25,
    },
    itemNameText: {
        fontSize: 17,
        color: 'gray',
        alignSelf: 'center',
        marginLeft: 10,
    },
    itemNoticeText: {
        marginLeft: 65,
        fontSize: 12,
        color: 'gray',
        alignSelf: 'center',
    },
});
