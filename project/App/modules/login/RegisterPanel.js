'use strict';

var React = require('react');var ReactNative = require('react-native');
var {
    StyleSheet,
    Image,
    Text,
    View,
    TextInput,
    TouchableOpacity,
} = ReactNative;

var Subscribable = require('Subscribable');
var {Button, WebviewMessageBox} = COMPONENTS;

module.exports = React.createClass({
    mixins: [Subscribable.Mixin],
    componentWillMount() {
        app.loginMgr.addRegisterEventListener(this);
    },
    onRegisterEventListener(obj) {
        this.onRegister(obj);
    },
    doRegister() {
        const {protocalRead, phone, password, rePassword, username, email} = this.state;
        if (!protocalRead) {
            Toast('注册前请先阅读用户协议');
            return;
        }
        if (!app.utils.checkPhone(phone)) {
            Toast('请填写正确的手机号码');
            return;
        }
        if (!app.utils.checkPassword(password)) {
            Toast('密码必须由 3-20 位的数字或，字母，下划线组成');
            return;
        }
        if (password !== rePassword) {
            Toast('两次输入的密码不一致');
            return;
        }
        if (!username) {
            Toast('为了更好地体验，请输入您的昵称');
            return;
        }
        if (!app.utils.checkMailAddress(email)) {
            Toast('邮箱地址不规范，请重新输入');
            return;
        }
        var param = {
            userid:phone,
            email,
            username,
            password,
        };
        app.loginMgr.register(param);
    },
    onRegister(obj) {
        if (obj.error) {
            app.showError(obj.error);
            return;
        }
        this.props.changeToLoginPanel(this.state.phone);
    },
    doShowProtocal() {
        app.showModal(
            <WebviewMessageBox webAddress={app.route.ROUTE_USER_PROTOCOL}/>,
            CONSTANTS.APP_NAME+'用户协议',
        );
    },
    getInitialState() {
        return {
            phone: '',
            password: '',
            rePassword: '',
            username: '',
            email: '',
            protocalRead: true,
            overlayShow:false,
        };
    },
    changeProtocalState() {
        this.setState({protocalRead: !this.state.protocalRead});
    },
    render() {
        return (
            <View style={{flex:1}}>
                <View style={[styles.inputContainer]}>
                    <Text style={styles.text_phone_header}>+86</Text>
                    <TextInput
                        placeholder='手机号码'
                        onChangeText={(text) => this.setState({phone: text})}
                        style={styles.text_input}
                        keyboardType='phone-pad'
                        />
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder='输入密码'
                        secureTextEntry={true}
                        onChangeText={(text) => this.setState({password: text})}
                        style={styles.text_input2}
                        keyboardType='number-pad'
                        />
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder='再次输入密码'
                        secureTextEntry={true}
                        onChangeText={(text) => this.setState({rePassword: text})}
                        style={styles.text_input2}
                        />
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder='昵称'
                        onChangeText={(text) => this.setState({username: text})}
                        style={styles.text_input2}
                        />
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder='密码找回邮箱'
                        onChangeText={(text) => this.setState({email: text})}
                        style={styles.text_input2}
                        />
                </View>
                <View style={styles.btnRegisterContainer}>
                    <Button onPress={this.doRegister} style={styles.btnRegister} textStyle={styles.btnRegisterText}>注  册</Button>
                </View>
                <View style={styles.bottomContainer}>
                    <View style={styles.protocalContainer}>
                        <TouchableOpacity onPress={this.changeProtocalState}>
                            <Image
                                resizeMode='cover'
                                source={this.state.protocalRead?app.img.common_check:app.img.common_no_check}
                                style={styles.protocal_icon}
                                />
                        </TouchableOpacity>
                        <Text style={styles.protocal_text}>  我已阅读并同意 </Text>
                        <Button onPress={this.doShowProtocal} style={styles.protocal_button} textStyle={[styles.protocal_button_text, {color: app.THEME_COLOR}]}>{CONSTANTS.APP_NAME+'用户协议'}</Button>
                    </View>
                </View>
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
    text_phone_header: {
        color: '#A1A2A3',
        marginHorizontal: 10,
    },
    text_input: {
        paddingLeft: 10,
        height:40,
        width: 180,
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
    },
    text_input2: {
        paddingLeft: 10,
        height: 40,
        width: 320,
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
    },
    btnVerification: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    btnVerificationText: {
        fontSize: 14,
    },
    btnRegisterContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    btnRegister: {
        marginHorizontal: 10,
        paddingVertical: 16,
    },
    btnRegisterText: {
        fontSize: 20,
        fontWeight: '600',
    },
    bottomContainer: {
        height: 50,
    },
    protocalContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    protocal_icon: {
        height: 18,
        width: 18,
    },
    protocal_text: {
        fontSize: 13,
        color: '#B2B3B4',
    },
    protocal_button: {
        backgroundColor:'transparent',
    },
    protocal_button_text: {
        fontSize: 13,
    }
});
