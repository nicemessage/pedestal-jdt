<template>
  <div class="pedestal-root-node">
    <layout-board></layout-board>
  </div>
</template>
<script>
import LayoutBoard from './components/newPortal/LayoutBord.vue'


export default {
  name: 'App',
  components: {
    LayoutBoard,
  },
};
</script>

<style lang="scss">
:root {
  --color-primary-root: #F2270C
}
body{
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serf !important;
  -webkit-font-smoothing: subpixel-antialiased!important;
}
body{
  line-height: 1 !important;
}
</style>

<style lang="scss" scoped>
#pedestal-app {
  text-align: center;
  color: #2c3e50;
}
.pedestal-root-node{
  position: relative;
}

</style>
