<template>
    <div id="app"> 
        <router-view/>
    </div>
</template>
<script>
export default {
    name: 'app',
    methods: {
        remInit(doc, win) {
            let docEl = doc.documentElement,
                resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
                recalc = function() {
                    let clientWidth = docEl.clientWidth
                    if (!clientWidth) return
                    // if (clientWidth >= 740) {
                    //     clientWidth = 740
                    // }
                    // if (clientWidth <= 320) {
                    //     clientWidth = 320
                    // }
                    docEl.style.fontSize = 100 * (clientWidth / 750) + 'px'
                }
            if (!doc.addEventListener) return
            recalc();
            win.addEventListener(resizeEvt, recalc, false)
        }
    },
    mounted() {
        this.remInit(document, window)
    }
} 
</script>
<style> 
#app { 
    width: 100%;
    height: 100%;
}
</style>
