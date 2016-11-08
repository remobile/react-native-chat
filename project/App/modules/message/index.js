'use strict';

var React = require('react');var ReactNative = require('react-native');
var {
    StyleSheet,
    View,
    Text,
    Image,
    ListView,
} = ReactNative;

var Subscribable = require('Subscribable');
var IndexedListView =  require('@remobile/react-native-indexed-listview');

module.exports = React.createClass({
    mixins: [Subscribable.Mixin],
    getInitialState() {
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return {
            dataSource: ds.cloneWithRows(app.userMgr.newestMessage),
        }
    },
    componentWillMount() {
        app.userMgr.addUserListChangeListener(this);
        app.messageMgr.addNewestMessageChangeListener(this);
    },
    onUserListChangeListener() {
        this.setState({dataSource: ds.cloneWithRows(app.userMgr.newestMessage)});
    },
    onNewestMessageChangeListener() {
        this.setState({dataSource: ds.cloneWithRows(app.userMgr.newestMessage)});
    },
    showMessageInfo: function(passProps) {
        // app.navigator.push({
        //     component: MessageInfo,
        //     passProps,
        // });
    },
    renderSeparator(sectionID, rowID) {
        return (
            <View style={styles.separator} key={rowID}/>
        );
    },
    renderRow(obj) {
        var {type, userid, groupid, time, msg, msgtype, touserid} = obj;
        var user = app.userMgr.users[userid];
        var username = (userid===app.loginMgr.userid)?"我":(user.username);
        var isGroup = (msg.type===app.messageMgr.GROUP_TYPE);
        return (
            <View style={styles.row}>
                <Image
                    resizeMode='stretch'
                    source={app.img.login_qq_button}
                    style={styles.avatar}
                    />
                <View style={styles.messageContainer}>
                    <Text sytle={styles.username}>{username}</Text>
                    <Text sytle={styles.msg}>{msg}</Text>
                    <Text sytle={styles.time}>{msg}</Text>
                </View>
            </View>
        )
    },
    render() {
        const {list} = this.state;
        return (
            <View style={styles.container}>
                <ListView
                    style={styles.list}
                    dataSource={this.state.dataSource}
                    renderRow={this.renderRow}
                    renderSeparator={this.renderSeparator}
                    />
            </View>
        )
    },
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    separator: {
        height: 1,
        backgroundColor: '#CCC'
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
    messageContainer: {

    },
    username: {
        fontSize: 16,
    }
    msg: {
        fontSize: 16,
    }
    time: {
        fontSize: 16,
    }
});
