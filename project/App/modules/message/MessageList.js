'use strict';

var React = require('react');
var ReactNative = require('react-native');
var {
    StyleSheet,
    View,
    Text,
    Image,
    ListView,
    ActivityIndicator,
} = ReactNative;

var Subscribable = require('Subscribable');
var InvertibleScrollView = require('react-native-invertible-scroll-view');
var MessageContainer = require('./MessageContainer.js');

module.exports = React.createClass({
    mixins: [Subscribable.Mixin],
    getInitialState() {
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return {
            dataSource: this.ds.cloneWithRows(app.messageMgr.displayMessage),
            loading: false,
        };
    },
    componentWillMount() {
        app.messageMgr.addDisplayMessageChangeListener(this);
    },
    onDisplayMessageChangeListener() {
        this.setState({loading: false});
        this.setState({dataSource: this.ds.cloneWithRows(app.messageMgr.displayMessage)});
    },
    componentDidMount() {
        const {type, targetid} = this.props;
        this.setState({loading: true});
        app.messageMgr.getMessage(type, targetid);
    },
    onEndReached() {
        const {messageMgr} = app;
        if (!messageMgr.serverMessageHasAllGet) {
            messageMgr.getMessage();
        }
    },
    onTouchStart() {
        this._touchStarted = true;
    },
    onTouchMove() {
        this._touchStarted = false;
    },
    onTouchEnd() {
        if (this._touchStarted) {
            this.props.hideKeyboard();
        }
        this._touchStarted = false;
    },
    scrollTo(options) {
        this.scrollRef.scrollTo(options);
    },
    renderFooter() {
        const {loading} = this.state;
        return (
            loading ?
            <View style={styles.footer}>
                <ActivityIndicator
                color='gray'
                size='small'
                style={[styles.activityIndicator, this.props.activityIndicatorStyle]}
                />
            </View>
            :
            null
        )
    },
    renderScrollComponent(props) {
        const {invertibleScrollViewProps} = this.props;
        return (
            <InvertibleScrollView
            {...props}
            inverted
            onTouchStart={this.onTouchStart}
            onTouchMove={this.onTouchMove}
            onTouchEnd={this.onTouchEnd}
            ref={component => this.scrollRef = component}
            />
        );
    },
    renderRow(obj) {
        const {type, userid, touserid, groupid, msg, msgtype, send, timeLabel} = obj;
        const wordsList = this.props.parseWordsListFromText(msg);
        const source = app.img.login_qq_button;
        return (
            <View>
                {
                    timeLabel &&
                    <View style={styles.timeLabelRow}>
                    <View style={styles.timeLabelContainer}>
                    <Text style={styles.timeLabel}>{timeLabel}</Text>
                    </View>
                    </View>
                }
                <View style={styles.row}>
                    { !send && <Image resizeMode='stretch' source={source} style={styles.avatar} /> }
                <View style={{flex:1}}>
                <MessageContainer style={styles.message} send={send}>
                    {wordsList}
                </MessageContainer>
                </View>
                    { !!send && <Image resizeMode='stretch' source={source} style={styles.avatar} /> }
                </View>
            </View>
        )
    },
    render() {
        return (
            <View style={styles.container}>
                <ListView
                    style={styles.list}
                    onEndReached={this.onEndReached}
                    onEndReachedThreshold={100}
                    enableEmptySections={true}
                    keyboardShouldPersistTaps={true}
                    automaticallyAdjustContentInsets={false}
                    initialListSize={20}
                    pageSize={1}
                    dataSource={this.state.dataSource}
                    renderRow={this.renderRow}
                    renderFooter={this.renderFooter}
                    renderScrollComponent={this.renderScrollComponent}
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
    },
    list: {
        flex: 1,
        width: sr.w,
    },
    footer: {
        height: 20,
        alignItems: 'center',
    },
    timeLabelRow: {
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeLabelContainer: {
        backgroundColor: '#C2BFC3',
        padding: 5,
        borderRadius: 2,
    },
    timeLabel: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    row: {
        width: sr.w,
        flexDirection: 'row',
        paddingVertical: 10,
    },
    avatar: {
        height: 40,
        width: 40,
        borderRadius: 20,
        marginHorizontal: 4,
    },
    message: {
        width: sr.w*2/3,
    },
});
