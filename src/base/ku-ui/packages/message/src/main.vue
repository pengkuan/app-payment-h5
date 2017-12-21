<template>
  <transition name="fade">
    <div class="kiko-message" v-if="isShow">
      {{message}}
    </div>
  </transition>
</template>

<script type="text/javascript">
  export default {
    name: 'kiko-message',
    data () {
      return {
        message: '',
        time: 2000,
        isShow: true
      }
    },
    mounted () {
      this.close()
    },
    methods: {
      close () {
        var that = this
        window.setTimeout(function() {
          that.isShow = false
        }, this.time);
      }
    }
  }
</script>

<style type="text/css" scoped>
  .kiko-message {
    position: fixed;
    min-width: 2rem;
    padding: 0.1rem;
    color: #fff;
    background-color: #5F6161;
    border-radius: 0.04rem;
    top:50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 999999999;
    font-size: 0.26rem;
    text-align: center;

  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active in below version 2.1.8 */ {
    opacity: 0
  }
</style>
