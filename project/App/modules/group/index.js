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
});
