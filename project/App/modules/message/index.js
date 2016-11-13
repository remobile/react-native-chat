'use strict';

var React = require('react');var ReactNative = require('react-native');
var {
    StyleSheet,
    View,
    Text,
    Image,
    ListView,
    TouchableHighlight,
} = ReactNative;

var Subscribable = require('Subscribable');
const images = require('./expressions').images;
var getTimeLabel = require('./getTimeLabel.js');
var MessageInfo = require('./MessageInfo.js');
var CacheImage = require('@remobile/react-native-cache-image');

module.exports = React.createClass({
    mixins: [Subscribable.Mixin],
    getInitialState() {
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return {
            dataSource: this.ds.cloneWithRows(app.messageMgr.newestMessage),
        }
    },
    componentWillMount() {
        app.userMgr.addUserListChangeListener(this);
        app.messageMgr.addNewestMessageChangeListener(this);
    },
    onUserListChangeListener() {
        this.setState({dataSource: this.ds.cloneWithRows(app.messageMgr.newestMessage)});
    },
    onNewestMessageChangeListener() {
        this.setState({dataSource: this.ds.cloneWithRows(app.messageMgr.newestMessage)});
    },
    componentDidMount() {
        app.utils.until(
            ()=>app.userMgr.init/*&&app.groupMgr.init*/,
            (cb)=>setTimeout(cb, 100),
            ()=>app.messageMgr.getNewestMessage(app.loginMgr.userid)
        );
    },
    showMessageInfo: function(type, targetid) {
        app.navigator.push({
            component: MessageInfo,
            passProps: {type, targetid},
        });
    },
    renderSeparator(sectionID, rowID) {
        return (
            <View style={styles.separator} key={rowID}/>
        );
    },
    parseWordsListFromText(text) {
        const {fontSize} = StyleSheet.flatten(styles.msg);
        const emojiStyle = {style:{width:fontSize, height:fontSize, marginHorizontal:1}};
        let line = [];
        let hasEscapeStart = false, escapeText = '';
        for(var i = 0, len = text.length; i < len; i++) {
            let char = text.charAt(i);
            if (char === '\n') {
                break;
            } else if (char === ':') {
                if (!hasEscapeStart) {
                    hasEscapeStart = true;
                } else {
                    if (!escapeText) {
                        line.push(<Text key={i}>:</Text>);
                    } else {
                        line.push(<Image key={i} resizeMode='stretch' source={images[escapeText]} {...emojiStyle} />);
                    }
                    hasEscapeStart = false;
                    escapeText = '';
                }
            } else {
                if (hasEscapeStart) {
                    escapeText += char;
                } else {
                    line.push(<Text key={i}>{char}</Text>);
                }
            }
        }
        return line;
    },
    renderRow(obj) {
        const {type, userid, groupid, time, msg, msgtype, touserid} = obj;
        const {users} = app.userMgr;
        const user = users[userid];
        const head = users[userid].head;
        const username = (userid===app.loginMgr.userid)?"我":(user.username);
        const isGroup = (type===app.messageMgr.GROUP_TYPE);
        return (
            <TouchableHighlight underlayColor="#CFCFCF" onPress={this.showMessageInfo.bind(null, type, userid)}>
                <View style={styles.row}>
                    <CacheImage
                        resizeMode='stretch'
                        defaultImage={app.img.personal_default_head}
                        url={app.route.ROUTE_USER_HEAD(head)}
                        style={styles.avatar}
                        cacheId={'userhead_'+userid}
                        />
                    <View style={styles.messageContainer}>
                        <Text style={styles.username} numberOfLines={1}>{username}</Text>
                        <Text style={styles.msg} numberOfLines={1}>{this.parseWordsListFromText(msg)}</Text>
                        <Text style={styles.time}>{getTimeLabel(time)}</Text>
                    </View>
                </View>
            </TouchableHighlight>
        )
    },
    render() {
        const {list} = this.state;
        return (
            <View style={styles.container}>
                <ListView
                    enableEmptySections={true}
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
        paddingVertical:6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        height: 60,
        width: 60,
        borderRadius: 30,
        marginHorizontal: 10,
    },
    messageContainer: {
        flex: 1,
        paddingRight: 80,
        height: 60,
        justifyContent: 'space-around',
    },
    username: {
        fontSize: 18,
    },
    msg: {
        fontSize: 14,
        color: 'gray',
        lineHeight: 26,
    },
    time: {
        fontSize: 13,
        color: 'gray',
        position: 'absolute',
        right: 10,
        top: 0,
    },
});
