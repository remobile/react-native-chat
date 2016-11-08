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
    renderRow(obj, sectionID, rowID) {
        var {username} = app.userMgr.users[obj];
        return (
            <View style={styles.row}>
                <Image
                    resizeMode='stretch'
                    source={app.img.login_qq_button}
                    style={styles.avatar}
                    />
                <Text sytle={styles.username}>{username}</Text>
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
