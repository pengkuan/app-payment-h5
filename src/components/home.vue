<template>
    <div id="root">
        <div class="home-wrap" v-show="home_page_show">
            <div class="logo"></div>
            <div class="input-box">
                <p class="phone">
                    <input type="text" placeholder="请输入手机号码" autocomplete="off" v-model="phone">
                </p>
                <p class="code">
                    <input type="text" placeholder="请输入验证码" autocomplete="off" v-model="code" @focus="code_focus">
                    <button class="get-code" @click="get_code" :disabled="get_code_disable" v-show="get_code_show">{{get_code_text}}</button>
                </p>
            </div>
            <button class="submit" @click="getMoney">确认收款</button>
            <div class="tips" v-show="video_code_show_tit">
                <span>收不到短信?<button class="get-video-code" @click="get_video_code_ways">{{get_video_code_text}}</button></span>
            </div>
            <div class="phone-calling" v-show="video_code_show">
                <p>电话拨打中...请留意来电</p>
                <p>{{video_code_text_count}}</p>
            </div>
            <transition name="fade">
                <div class="msg-box-wrap" v-show="msgTipShow" @click.self="click_filter_cancel">
                    <div class="msg-box">
                        <h3 class="tit">接收语音验证码</h3>
                        <p class="content">验证码以电话形式通知您，请留意您的电话</p>
                        <p class="confirm">
                            <span class="cancel" @click.self="cancel">取消</span>
                            <span class="ok" @click="click_ok">接收</span>
                        </p>
                    </div>
                </div>
            </transition>
            <div v-kiko-loading.fullscreen="loadingFullscreen"></div>
        </div>
        <div class="success-tip-wrap" v-show="success_page_show">
            <div class="pic-money">
                <img src="../common/img/pic__money.png" alt="pic_money">
            </div>
            <div class="notify">
                收款成功
            </div>
            <div class="desc">
                请在微信中查看：我-钱包-零钱
            </div>
            <div class="line"></div>
            <div class="pic">
                <img src="../common/img/pic.png" alt="pic">
            </div>
        </div>
        <div class="active-wrap" v-show="active_page_show">
            <div class="pic-money">
                <img src="../common/img/pic__money.png" alt="pic_money">
            </div>
            <div class="notify">
                收款成功
            </div>
            <div class="desc">
                请在微信中查看：我-钱包-零钱
            </div>
            <div class="line"></div>
            <div class="pic-active">
                <div class="active-text">
                    <div class="text-line"></div>
                    <span class="text">活动</span>
                </div>
                <div class="active-url">
                    <img src="../common/img/active-url.png" alt="url">
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import api from '@/api'
import util from '@/common/js/util'
export default {
    data() {
        return {
            phone: '',
            code: '',
            msgTipShow: false,
            loadingFullscreen: false,
            // 短信验证码相关
            get_code_show: true,
            get_code_text: '获取验证码',
            get_code_disable: false,
            // 语音验证码相关
            video_code_show: false,
            video_code_show_tit: true,
            video_code_text_count: '60S后重试',
            get_video_code_text: '获取语音验证码',

            // 接口参数
            payToken: '',
            wechatCode: '',
            orderId: '',
            accountType: '',
            wechatOpenId: '',
            newAccountFlag: '',
            subEventId: '',

            // 控制主页面的显示隐藏，改为类单页
            success_page_show: false,
            home_page_show: true,
            active_page_show: false,

            // 处理软键盘兼容问题
            window_h: 0,
            curr_h: 0

        }
    },
    methods: {
        getMoney() {

            if (!/^1[3|4|5|7|8]\d{9}$/.test(this.phone)) {
                this.$message('请输入正确手机号')
                return
            }
            if (!/^\d{6}$/.test(this.code)) {
                this.$message('请输入6位验证码')
                return
            }
            this.loadingFullscreen = true

            console.log('开始请求付款接口')
            let data = {
                system: '2bapp_wechat_pay_h5',
                payToken: this.payToken,
                wechatCode: this.wechatCode,
                userTel: this.phone,
                telCode: this.code
            }
            //获取二维码收款账号
            api.get_qrcode_payaccount(data).then((res) => {
                if (res.body.ret != '0') {
                    this.$message(res.body.retinfo)
                    this.loadingFullscreen = false
                    return Promise.reject(res.body.retinfo)
                }
                this.accountType = res.body.data.accountType
                this.wechatOpenId = res.body.data.wechatOpenId
                this.newAccountFlag = res.body.data.newAccountFlag
                return Promise.resolve()
            }, (error) => { console.log(error) }).then((res) => {
                let params = {
                    system: '2bapp_wechat_pay_h5',
                    appusetype: '',
                    uid: '',
                    login_token: '',
                    orderId: this.orderId,
                    accountType: this.accountType,
                    account: this.wechatOpenId,
                    newAccountFlag: this.newAccountFlag,
                    payToken: this.payToken,
                    wechatCode: this.wechatCode
                }
                //订单预付款 + 事件通知
                api.collect_money(params).then((res) => {
                    if (res.body.ret == 1 && res.body.retcode == 'OC2B00011046') {
                        this.$message(res.body.retinfo)
                        this.eventNotice('errorTimeout')
                        this.loadingFullscreen = false
                        return
                    }
                    if (res.body.ret == 1 && res.body.retcode != 'OC2B00011046') {
                        this.$message(res.body.retinfo)
                        this.eventNotice('error')
                        this.loadingFullscreen = false
                        return
                    }
                    if (res.body.ret == '0') {
                        this.eventNotice('success')
                        // 付款成功提示跳转页面 
                        // loading是异步 ？？？
                        let p = new Promise((resolve, reject) => {
                            return resolve(this.loadingFullscreen = false)
                        })
                        p.then(() => {
                            this.success_page_show = true
                            this.home_page_show = false
                        })
                    }


                })
            }, (error) => { console.log(error) })
        },
        cancel() {
            this.msgTipShow = false
        },
        click_filter_cancel() {
            this.msgTipShow = false
        },
        // 获取短信验证码
        get_code() {
            if (!/^1[3|4|5|7|8]\d{9}$/.test(this.phone)) {
                this.$message('请输入正确手机号')
                return
            }
            this.get_code_interface('1')
        },
        // 短信验证码倒计时函数  
        count_down() {
            let timer = null
            let count = 60
            timer = setInterval(() => {
                count--
                this.get_code_text = count + 'S'
                if (count == 0) {
                    clearInterval(timer)
                    this.get_code_text = '再次获取验证码'
                    this.get_code_disable = false
                }
            }, 1000)
        },
        // 语音验证码倒计时函数
        count_down_video() {
            let timer = null
            let count = 60
            timer = setInterval(() => {
                count--
                this.video_code_text_count = count + 'S后重试'
                if (count == 0) {
                    clearInterval(timer)
                    this.get_video_code_text = '再次获取语音验证码'
                    this.video_code_text_count = '60S后重试'
                    this.video_code_show_tit = true
                    this.video_code_show = false
                }
            }, 1000)
        },
        // 获取语音验证码
        get_video_code_ways() {
            if (!/^1[3|4|5|7|8]\d{9}$/.test(this.phone)) {
                this.$message('请输入正确手机号')
                return
            }
            this.msgTipShow = true
        },
        //获取语音验证码，并点击接收按钮
        click_ok() {
            this.msgTipShow = false
            this.get_code_interface('2')
        },
        // 加载页面信息，获取订单号和微信昵称
        load_payment_page() {
            let wechatCode = util.getUrlParam('code') || '',
                payToken = util.getUrlParam('payToken') || ''
            // 开发环境调试，code和token写死 
            if (process.env.NODE_ENV != 'production') {
                wechatCode = '013cHTRe0fmuXA1IIMQe0h7VRe0cHTR6'
                payToken = '20f517fc346df8b25bf0681d464a404d'
            }
            console.log(`wechatCode是${wechatCode}\n`, `payToken是${payToken}`)
            this.payToken = payToken
            this.wechatCode = wechatCode
            let params = {
                system: '2bapp_wechat_pay_h5',
                payToken: payToken,
                wechatCode: wechatCode
            }
            api.load_payment_page(params).then((res) => {
                console.log(res)
                if (res.body.ret != '0') {
                    this.$message(res.body.retinfo)
                    return
                }
                this.orderId = res.body.data.orderId

            })
        },
        // 请求验证码接口封装
        get_code_interface(type) {
            let flag = ''
            if (type == '1') {
                flag = '1' //手机短信
            }
            if (type == '2') {
                flag = '2' //语音短信
            }
            let data = {
                system: '2bapp_wechat_pay_h5',
                payToken: this.payToken,
                wechatCode: this.wechatCode,
                userTel: this.phone,
                verifiType: flag
            }
            //这接口只接收验证码，其他数据不返回
            api.pay_get_verifi_code(data).then((res) => {
                if (res.body.ret != '0') {
                    this.$message(res.body.retinfo)
                    return
                }
                // 接口请求回来再倒计时，同一类型接口55秒重复点是会报错的
                // 接口请求成功事件和收到短信的时间不一样
                if (type == '1') {
                    this.get_code_text = '60S'
                    this.get_code_disable = true
                    this.count_down()
                } else if (type == '2') {
                    this.video_code_show = true
                    this.video_code_show_tit = false
                    this.count_down_video()
                }
            })
        },
        // 第三方事件通知
        eventNotice(flag) {
            if (flag == 'success') {
                this.subEventId = '0';
            }

            if (flag == 'error') {
                this.subEventId = '2';
            }

            if (flag == 'errorTimeout') {
                this.subEventId = '1';
            }
            let params = {
                system: '',
                orderType: '2B',
                appUseType: '',
                uid: '',
                login_token: '',
                orderId: this.orderId,
                subEventId: this.subEventId
            }
            api.notify(params).then((res) => {
                console.log(res)
            })
        },
        code_focus() {
            // 调试用
            if (process.env.NODE_ENV != 'production') { 

            }
        }
    },
    created() {

    },
    mounted() {
        this.load_payment_page()  

        // 处理安卓手机软键盘的兼容性问题
        window.addEventListener('resize', function() {
            if (document.activeElement.tagName === 'INPUT') {
                document.activeElement.scrollIntoView({ behavior: "smooth" })
            }
        })
    }
}

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '../common/css/mixin';
// 全局运动fade
.fade-enter-active,
.fade-leave-active {
    transition: all .5s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

.home-wrap {
    width: 7.5rem;
    height: 100%;
    padding-top: 1.6rem;
    background: url(../common/img/bg.png) 0 0 no-repeat;
    background-size: 7.5rem 5.89rem;
    font-family: 'PingFang-SC-Medium';
    position: relative;
    .logo {
        width: 3.78rem;
        height: 1.65rem;
        background: url(../common/img/login_logo.png) 0 0 no-repeat;
        background-size: 3.78rem 1.65rem;
        margin: 0 auto;
    }
    .input-box {
        width: 6.54rem;
        height: 2.4rem;
        border-radius: 0.08rem;
        background-color: #fff;
        margin: 1.1rem auto 0 auto;
        .phone,
        .code {
            height: 1.2rem;
            line-height: 1.2rem;
            padding: 0 2.5rem 0 0.70rem;
            box-sizing: border-box;
            @include bg-image('../common/img/ico_mobile');
            background-repeat: no-repeat;
            background-position: 0.24rem 0.38rem;
            background-size: 0.32rem 0.44rem;
            input {
                height: 100%; // 兼容iphone，将行号设置为何字体大小一致
                line-height: 0.3rem;
                width: 100%;
                font-size: 0.3rem;
                box-sizing: border-box;
                color: #666;
                vertical-align: top;
            }
             ::-webkit-input-placeholder {
                color: #ccc;
                font-family: 'PingFang-SC-Medium';
                font-size: 0.27rem;
                font-weight: normal;
                padding-top: 0.04rem;
            }
             :-moz-placeholder {
                color: #ccc;
                font-family: 'PingFang-SC-Medium';
                font-size: 0.27rem;
                font-weight: normal;
                padding-top: 0.04rem;
            }
             ::-moz-placeholder {
                color: #ccc;
                font-family: 'PingFang-SC-Medium';
                font-size: 0.27rem;
                font-weight: normal;
                padding-top: 0.04rem;
            }
             :-ms-input-placeholder {
                color: #ccc;
                font-family: 'PingFang-SC-Medium';
                font-size: 0.27rem;
                font-weight: normal;
                padding-top: 0.04rem;
            }
        }
        .code {
            @include bg-image('../common/img/ico_suo');
            background-repeat: no-repeat;
            background-position: 0.24rem 0.38rem;
            background-size: 0.32rem 0.40rem;
            border-top: 1px solid #f3f3f3;
            position: relative;
            .get-code {
                font-size: 0.28rem;
                color: #666;
                position: absolute;
                right: 0.2rem;
                top: 0.4rem;
                height: 0.4rem;
                line-height: 0.4rem;
                display: inline;
                background: transparent;
                border: none;
                padding: 0;
            }
        }
    }
    .submit {
        width: 6.54rem;
        height: 0.8rem;
        margin: 0.4rem auto 0.25rem auto;
        display: block;
        border-radius: 0.08rem;
        font-size: 0.36rem;
        color: #fff;
        background-color: #fc4646;
        border: none;
    }
    .tips,
    .phone-calling {
        width: 100%;
        height: 0.4rem;
        line-height: 0.4rem;
        text-align: center;
        color: #666;
        font-size: 0.24rem;
        .get-video-code {
            color: #656ff9;
            background: transparent;
            border: none;
            font-size: 0.24rem;
            padding: 0 0.05rem;
        }
    }
    .msg-box-wrap {
        position: fixed;
        left: 0;
        bottom: 0;
        right: 0;
        top: 0;
        background-color: rgba(0, 0, 0, 0.4);
        .msg-box {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 5.4rem;
            height: 3.2rem;
            transform: translate(-50%, -74%);
            background-color: #fff;
            border-radius: 0.08rem;
            padding-top: 0.3rem;
            box-sizing: border-box;
            .tit {
                height: 0.74rem;
                font-size: 0.36rem;
                line-height: 0.74rem;
                font-weight: bold;
                text-align: center;
            }
            .content {
                padding: 0 0.47rem 0.32rem 0.47rem;
                text-align: center;
                line-height: 0.48rem;
                font-size: 0.28rem;
                border-bottom: 1px solid #E6E6E5;
                color: #333;
            }
            .confirm {
                height: 0.87rem;
                font-size: 0;
                .cancel,
                .ok {
                    height: 100%;
                    display: inline-block;
                    width: 50%;
                    text-align: center;
                    line-height: 0.87rem;
                    color: #2c7de8;
                    font-size: 0.3rem;
                }
                .cancel {
                    box-sizing: border-box;
                    border-right: 1px solid #E6E6E5;
                }
                ,
                .ok {
                    font-family: 'PingFang-SC-Bold';
                    font-weight: bold;
                }
            }
        }
    }
}

</style>
<style scoped lang="scss">
.success-tip-wrap {
    width: 100%;
    height: 100%;
    background: #fff;
    font-family: 'PingFang-SC-Medium';
    text-align: center;
    .pic-money {
        padding: 0.48rem 0 0.4rem 0;
        img {
            width: 6.76rem;
            height: 3.38rem;
        }
    }
    .notify {
        height: 0.36rem;
        line-height: 0.36rem;
        font-size: 0.36rem;
        color: #333;
    }
    .desc {
        line-height: 0.7rem;
        padding-bottom: 0.2rem;
        font-size: 0.28rem;
        color: #666;
    }
    .line {
        height: 0.24rem;
        background: #F8F8F8;
    }
    .pic {
        width: 7.5rem;
        height: 7.4rem;
        img {
            width: 100%;
            height: 100%;
        }
    }
}

</style>
<style scoped lang="scss">
.active-wrap {
    width: 100%;
    height: 100%;
    background: #fff;
    font-family: 'PingFang-SC-Medium';
    text-align: center;
    .tit {
        height: 0.88rem;
        line-height: 0.88rem;
        font-size: 0.36rem;
        font-weight: bold;
        color: #333;
    }
    .pic-money {
        padding: 0.48rem 0 0.4rem 0;
        img {
            width: 6.76rem;
            height: 3.38rem;
        }
    }
    .notify {
        height: 0.36rem;
        line-height: 0.36rem;
        font-size: 0.36rem;
        color: #333;
    }
    .desc {
        line-height: 0.7rem;
        padding-bottom: 0.2rem;
        font-size: 0.28rem;
        color: #666;
    }
    .line {
        height: 0.24rem;
        background: #F8F8F8;
    }
    .pic-active {
        width: 7.5rem;
        height: 8.5rem;
        .active-text {
            width: 100%;
            height: 1rem;
            position: relative;
            .text-line {
                position: absolute;
                width: 4.06rem;
                height: 1px;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                background: #E5E5E5;
            }
            .text {
                position: absolute;
                width: 0.86rem;
                height: 0.24rem;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                font-size: 0.24rem;
                line-height: 0.24rem;
                background: #fff;
                color: #ccc;
            }
        }
        .active-url {
            height: 3.6rem;
            img {
                width: 6.54rem;
                height: 3.6rem;
            }
        }
    }
}

</style>
