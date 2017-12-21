import KikoMessage from './packages/message/index.js'
import KikoLoading from './packages/loading/index.js' 

const install = function(Vue) {
    Vue.component(KikoMessage.name, KikoMessage)
    Vue.component(KikoLoading.name, KikoLoading) 

    Vue.prototype.$message = KikoMessage.installMessage
}
export default install
