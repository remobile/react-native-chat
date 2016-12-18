'use strict';

var React = require('react');var ReactNative = require('react-native');
var {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableHighlight,
} = ReactNative;

var Subscribable = require('Subscribable');
var CacheImage = require('@remobile/react-native-cache-image');
var IndexedListView =  require('@remobile/react-native-indexed-listview');
var MessageInfo = require('../message/MessageInfo.js');

module.exports = React.createClass({
    mixins: [Subscribable.Mixin],
    getInitialState() {
        this.menuList = [{
            img: app.img.login_weixin_button,
            label: '群聊',
            onPress: this.showGroupList,
        }, {
            img: app.img.login_weixin_button,
            label: '发送给多人',
            onPress: this.sendMultiMessage,
        }, {
            img: app.img.login_weixin_button,
            label: '显示所有联系人',
            onPress: this.changeShowOnline,
        }];
        return {
            list: Object.assign({0: this.menuList}, app.userMgr.groupedUsers),
        }
    },
    componentWillMount() {
        app.userMgr.addUserListChangeListener(this);
    },
    onUserListChangeListener() {
        this.setState({
            list: Object.assign({0: this.menuList}, app.userMgr.groupedUsers),
        });
    },
    showGroupList() {
        console.log('showGroupList');
    },
    sendMultiMessage() {
        console.log('sendMultiMessage');
    },
    changeShowOnline() {
        console.log('changeShowOnline');
    },
    showMessageInfo: function(type, targetid) {
        app.navigator.push({
            component: MessageInfo,
            passProps: {type, targetid},
        });
    },
    renderRow(obj, sectionID, rowID) {
        if (obj.label) {
            var {img, label, onPress} = obj;
            return (
                <TouchableHighlight underlayColor="#CFCFCF" onPress={onPress}>
                    <View style={styles.row}>
                        <Image
                            resizeMode='stretch'
                            source={img}
                            style={styles.avatar}
                            />
                        <Text style={[styles.label]}>{label}</Text>
                    </View>
                </TouchableHighlight>
            )
        } else {
            var {username, online, head, userid} = app.userMgr.users[obj];
            var url = app.route.ROUTE_USER_HEAD(head);
            return (
                <TouchableHighlight underlayColor="#CFCFCF" onPress={this.showMessageInfo.bind(null, app.messageMgr.USER_TYPE, userid)}>
                    <View style={styles.row}>
                        <CacheImage
                            resizeMode='stretch'
                            defaultImage={app.img.personal_default_head}
                            url={url}
                            style={styles.avatar}
                            cacheId={'userhead_'+userid}
                            />
                        <Text style={[styles.username, {color: online?'green':'gray'}]}>{username}</Text>
                    </View>
                </TouchableHighlight>
            )
        }
    },
    render() {
        const {list} = this.state;
        return (
            <View style={styles.container}>
                <IndexedListView
                    list={list}
                    renderRow={this.renderRow}
                    />
            </View>
        )
    },
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    row: {
        paddingVertical:10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        height: 50,
        width: 50,
        borderRadius: 25,
        marginHorizontal: 20,
    },
    username: {
        fontSize: 16,
    }
});
