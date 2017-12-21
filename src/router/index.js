import Vue from 'vue'
import Router from 'vue-router'
import home from '@/components/home'
// 为了适配iPhone和安卓手机在微信上的返回一致，将路由去除
// import successTip from '@/components/successTip'
// import active from '@/components/active'

Vue.use(Router)

export default new Router({ 
    routes: [{
            path: '/',
            redirect: '/home',
        }, {
            path: '/home',
            name: 'home',
            component: home
        },
        // {
        //     path: '/successTip',
        //     name: 'successTip',
        //     component: successTip
        // }, {
        //     path: '/active',
        //     name: 'active',
        //     component: active
        // }
    ]
})
