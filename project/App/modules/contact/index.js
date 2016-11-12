'use strict';

var React = require('react');var ReactNative = require('react-native');
var {
    View,
    Text,
    Image,
    StyleSheet,
} = ReactNative;

var Subscribable = require('Subscribable');
var IndexedListView =  require('@remobile/react-native-indexed-listview');

module.exports = React.createClass({
    mixins: [Subscribable.Mixin],
    getInitialState() {
        return {
            list: Object.assign({}, app.userMgr.groupedUsers),
        }
    },
    componentWillMount() {
        app.userMgr.addUserListChangeListener(this);
    },
    onUserListChangeListener() {
        this.setState({
            list: Object.assign({}, app.userMgr.groupedUsers),
        });
    },
    renderRow(obj) {
        var {username, online, head} = app.userMgr.users[obj];
        var uri = app.route.ROUTE_USER_HEAD(head);
        console.log(uri);
        return (
            <View style={styles.row}>
                <Image
                    resizeMode='stretch'
                    source={{uri:uri}}
                    style={styles.avatar}
                    />
                <Text style={[styles.username, {color: online?'green':'gray'}]}>{username}</Text>
            </View>
        )
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
