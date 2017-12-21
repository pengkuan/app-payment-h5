


export default {
    //配置参数
    //配置参数
    // jsonpUrl: process.env.NODE_ENV == 'development' ? 'https://dev-app.huanjixia.com/api/appstore' : 'https://dev-app.huanjixia.com/api/appstore', //开发环境、测试环境 
    jsonpUrl: process.env.NODE_ENV == 'development' ? 'https://dev-app.huanjixia.com/api/appstore' : 'https://app.huanjixia.com/api/appstore', //开发环境、线上环境 
    // 公共方法
    // 公共方法 
    getUrlParam: function(name) {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
        var result = window.location.search.substr(1).match(reg)
        return result ? decodeURIComponent(result[2]) : null
    }
}
