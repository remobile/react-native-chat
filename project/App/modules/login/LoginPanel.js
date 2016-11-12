'use strict';

var React = require('react');var ReactNative = require('react-native');
var {
    StyleSheet,
    Image,
    View,
    TextInput,
    ListView,
    Text,
    TouchableOpacity,
} = ReactNative;

var Subscribable = require('Subscribable');
import {Checkbox} from 'antd-mobile';
var ForgetPassword = require('./ForgetPassword.js');
var Home = require('../home/index.js');
var {Button} = COMPONENTS;

var WeixinQQPanel = React.createClass({
    render() {
        return (
            <View style={styles.thirdpartyContainer}>
                <View style={styles.sepratorContainer}>
                    <View style={styles.sepratorLine}></View>
                    <Text style={styles.sepratorText} >{app.isandroid?'    ':''}或者您也可以</Text>
                </View>
                <View style={styles.thirdpartyButtonContainer}>
                    {
                        !!this.props.weixininstalled &&
                        <View style={styles.thirdpartyLeftButtonContainer}>
                            <Image
                                resizeMode='stretch'
                                source={app.img.login_weixin_button}
                                style={styles.image_button}
                                />
                            <Text style={styles.image_button_text}>微信登录</Text>
                        </View>
                    }
                    {
                        !!this.props.qqinstalled &&
                        <View style={styles.thirdpartyRightButtonContainer}>
                            <Image
                                resizeMode='stretch'
                                source={app.img.login_qq_button}
                                style={styles.image_button}
                                />
                            <Text style={styles.image_button_text}>QQ登录</Text>
                        </View>
                    }
                </View>
            </View>
        )
    }
});

var NoWeixinQQPanel = React.createClass({
    render() {
        return (
            <View style={styles.thirdpartyContainer2}>
                <Text style={[styles.thirdpartyContainer2_text, {color: app.THEME_COLOR}]}>天天聊         聊天天</Text>
            </View>
        )
    }
});

module.exports = React.createClass({
    mixins: [Subscribable.Mixin],
    componentWillMount() {
        app.loginMgr.addLoginEventListener(this);
    },
    onLoginEventListener(obj) {
        this.onLogin(obj);
    },
    getInitialState() {
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        const history = app.loginMgr.history[0]||{};
        const {userid, password, autoLogin} = history;
        return {
            phone: this.props.phone||userid,
            password: password,
            remeberPassword: !!password,
            autoLogin: autoLogin,
            dataSource: ds.cloneWithRows(app.loginMgr.history.map((o)=>o.userid)),
            showList: false,
            weixininstalled: false,
            qqinstalled: false,
        };
    },
    doLogin() {
        const {phone, password, remeberPassword, autoLogin} = this.state;
        if (!app.utils.checkPhone(this.state.phone)) {
            Toast('手机号码不是有效的手机号码');
            return;
        }
        if (!app.utils.checkPassword(password)) {
            Toast('密码必须有6-20位的数字，字母，下划线组成');
            return;
        }
        app.loginMgr.login({userid:phone, password, remeberPassword, autoLogin});
    },
    onLogin(obj) {
        if (!obj.error) {
            app.navigator.replace({
                component: Home,
            });
        }
    },
    doShowForgetPassword() {
        app.navigator.push({
            component: ForgetPassword,
            passProps: {
                phone: this.state.phone,
            },
        });
    },
    onPhoneTextInputLayout(e) {
        var frame = e.nativeEvent.layout;
        this.listTop = frame.y+ frame.height;
    },
    renderRow(text) {
        return (
              <TouchableOpacity onPress={()=>this.setState({phone: text, showList:false})}>
                <Text style={styles.itemText}>
                  {text}
                </Text>
              </TouchableOpacity>
        )
    },
    renderSeparator(sectionID, rowID) {
        return (
            <View style={styles.separator} key={sectionID+rowID}/>
        );
    },
    onFocus() {
        const {dataSource} = this.state;
        this.setState({showList: dataSource.getRowCount()>0 && dataSource.getRowData(0, 0).length < 11});
    },
    onBlur() {
        this.setState({showList: false});
    },
    onPhoneTextChange(text) {
        const {dataSource} = this.state;
        var newData = _.filter(app.loginMgr.list, (item)=>{var reg=new RegExp('^'+text+'.*'); return reg.test(item)});
        this.setState({
            phone: text,
            dataSource: dataSource.cloneWithRows(newData),
            showList: newData.length > 0 && text.length < 11,
        });
    },
    onCheckBoxChange(type) {
        if (type === 0) {
            this.setState({remeberPassword: !this.state.remeberPassword});
        } else {
            this.setState({autoLogin: !this.state.autoLogin});
        }
    },
    render() {
        const {dataSource, showList, phone, password, remeberPassword, autoLogin, weixininstalled, qqinstalled} = this.state;
        var row = dataSource.getRowCount();
        var listHeight = row>4?styles.listHeightMax:row<2?styles.listHeightMin:null;
        return (
            <View style={{flex:1}}>
                <View
                    style={styles.inputContainer}
                    onLayout={this.onPhoneTextInputLayout}
                    >
                    <Image
                        resizeMode='stretch'
                        source={app.img.login_user}
                        style={styles.input_icon}
                        />
                    <TextInput
                        placeholder="您的手机号码"
                        onChangeText={this.onPhoneTextChange}
                        defaultValue={phone}
                        style={styles.text_input}
                        keyboardType='phone-pad'
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        />
                </View>
                <View style={styles.inputContainer}>
                    <Image
                        resizeMode='stretch'
                        source={app.img.login_locked}
                        style={styles.input_icon}
                        />
                    <TextInput
                        placeholder="您的密码"
                        secureTextEntry={true}
                        onChangeText={(text) => this.setState({password: text})}
                        defaultValue={password}
                        style={styles.text_input}
                        />
                </View>
                <View style={styles.checkboxContainer}>
                    <View style={styles.checkbox}>
                        <Checkbox defaultChecked={remeberPassword} onChange={this.onCheckBoxChange.bind(null, 0)}/>
                        <Text>记住密码</Text>
                    </View>
                    <View style={styles.checkbox}>
                        <Checkbox defaultChecked={autoLogin} onChange={this.onCheckBoxChange.bind(null, 1)}/>
                        <Text>自动登录</Text>
                    </View>
                </View>
                <View style={styles.btnForgetPassWordContainer}>
                    <Button onPress={this.doShowForgetPassword} style={styles.btnForgetPassWord} textStyle={styles.btnForgetPassWordText}>忘记密码?</Button>
                </View>
                <View style={styles.btnLoginContainer}>
                    <Button onPress={this.doLogin} style={styles.btnLogin} textStyle={styles.btnLoginText}>账号登录</Button>
                </View>
                {qqinstalled || weixininstalled ? <WeixinQQPanel qqinstalled={tqqinstalled} weixininstalled={weixininstalled}/>: <NoWeixinQQPanel />}
                {
                    showList &&
                    <ListView                        initialListSize={1}
                        enableEmptySections={true}
                        dataSource={dataSource}
                        keyboardShouldPersistTaps={true}
                        renderRow={this.renderRow}
                        renderSeparator={this.renderSeparator}
                        style={[styles.list, {top: this.listTop}, listHeight]}
                        />
                }
            </View>
        )
    }
});


var styles = StyleSheet.create({
    inputContainer: {
        height: 50,
        marginTop: 20,
        marginHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D7D7D7',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        overflow: 'hidden',
        alignItems:'center',
    },
    input_icon: {
        width: 28,
        height: 28,
    },
    text_input: {
        height:40,
        width: 250,
        fontSize:14,
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxContainer: {
        paddingHorizontal: 50,
        height: 80,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    checkbox: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnForgetPassWordContainer: {
        height: 50,
        justifyContent:'center',
    },
    btnForgetPassWord: {
        marginRight: 20,
        borderRadius: 5,
        alignSelf: 'flex-end',
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    btnForgetPassWordText: {
        fontSize: 14,
    },
    btnLoginContainer: {
        height: 100,
        justifyContent:'space-around',
        alignItems: 'flex-end',
        flexDirection: 'row',
    },
    btnLogin: {
        height: 40,
        width: 130,
    },
    btnLoginText: {
        fontSize: 20,
        fontWeight: '600',
    },
    thirdpartyContainer: {
        flex:1,
    },
    sepratorContainer: {
        height: 30,
        alignItems:'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    sepratorLine: {
        top: 10,
        height: 2,
        width: sr.w-20,
        backgroundColor: '#858687',
    },
    sepratorText: {
        backgroundColor:'#EEEEEE',
        color: '#A3A3A4',
        paddingHorizontal: 10,
    },
    thirdpartyButtonContainer: {
        marginTop: 30,
        height: 120,
        flexDirection: 'row',
    },
    thirdpartyLeftButtonContainer: {
        flex:1,
        alignItems:'center',
    },
    thirdpartyRightButtonContainer: {
        flex:1,
        alignItems:'center',
    },
    image_button: {
        width: 80,
        height: 80,
        margin: 10,
    },
    image_button_text: {
        color: '#4C4D4E',
        fontSize: 16,
    },
    thirdpartyContainer2: {
        flex: 1,
        alignItems:'center',
        justifyContent: 'center',
    },
    thirdpartyContainer2_text: {
        fontSize: 18,
    },
    list: {
        position: 'absolute',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#D7D7D7',
        width: sr.w-48,
        left: 38,
        padding: 10,
    },
    listHeightMin: {
        height: 100,
    },
    listHeightMax: {
        height: 184,
    },
    itemText: {
        fontSize: 16,
        marginTop:20,
    },
    separator: {
      backgroundColor: '#DDDDDD',
      height: 1,
    },
});
