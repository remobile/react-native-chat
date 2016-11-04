'use strict';
var React = require('react');
var ReactNative = require('react-native');
var App = require('./App/index.js');

var Chat = React.createClass({
    render() {
        return(
            <App />
        );
    }
});

ReactNative.AppRegistry.registerComponent('Chat', () => Chat);
