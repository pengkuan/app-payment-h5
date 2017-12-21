import axios from 'axios'
import originJsonp from 'jsonp'
import util from '@/common/js/util'


/* jsonp接口封装开始 */
export function jsonp(_interface, params) {
    let url = `${util.jsonpUrl}?type=jsonp`, 
        timestamps = Math.floor(new Date().getTime() / 1000) + ''

    let resParams = {
        "head": {
            "version": "0.01",
            "msgtype": "request",
            "interface": _interface,
            "remark": ""
        },
        "params": {
            "system": "",
            "time": timestamps,
            "sign": "sign",
            "payToken": "",
            "wechatCode": ""
        }
    }
    // 合并参数 
    resParams.params = Object.assign({}, resParams.params, params)
    for (let i in resParams) {
        for (let j in resParams[i]) {
            url += `&${i}[${j}]=${resParams[i][j]}`
        }
    }
    // url = `${url}&head[version]=0.01&head[msgtype]=request&head[interface]=newSystem&head[remark]=&params[system]=test&params[number]=12345678`   
    return new Promise((resolve, reject) => {
        originJsonp(url, { param: 'callback' }, (err, data) => {
            if (!err) {
                resolve(data)
            } else {
                reject(err)
            }
        })
    })
}
/* jsonp接口封装结束 */

export default {
    load_payment_page(params) { return jsonp('order-2bapp_load_payment_page', params) },                //加载微信回调url信息接口
    pay_get_verifi_code(params) { return jsonp('order-2bapp_pay_get_verifi_code', params) },            //请求短信或语音验证码接口 
    get_qrcode_payaccount(params) { return jsonp('order-2bapp_get_qrcode_payaccount', params) },        //获取二维码收款账号接口
    collect_money(params) { return jsonp('order-2bapp_collect_money', params) },                        //订单预付款接口
    notify(params) { return jsonp('order-order_notify', params) },                                      //付款后，第三方事件通知接口 
}
