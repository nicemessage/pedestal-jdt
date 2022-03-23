<template>
  <div class="pedestal-sys-side-menu" @mouseover.stop="tabPlatform(true)" @mouseleave.stop="tabPlatform(false)">
    <div class="pedestal-menus"
     v-for="(menu, menuIndex) in menuList"
     :key="menu.id"
    >
      <div class="title">
        <span></span>
        <h6>{{menu.name}}</h6>
      </div>
      <div class="pedestal-menus-box">
        <div
          v-for="(item, index) in menu.children"
          :key="item.moduleCode"
          @click="handleSelect(menuIndex, index)"
          :class="{active: defaultActive === item.moduleCode}"
          class="pedestal-menu-item"
        >
          <i :class="item.icons"></i>
          <div>{{item.enName}}</div>
          <p>{{item.name}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseImg from '@/assets/images/menus/base.png';
import DBImg from '@/assets/images/menus/DB.png';
import manageImg from '@/assets/images/menus/manage.png';
import AIImg from '@/assets/images/menus/AI.png';
import ApplyImg from '@/assets/images/menus/apply.png';
import serverImg from '@/assets/images/menus/server.png';
import timeImg from '@/assets/images/menus/time.png';
import photoImg from '@/assets/images/menus/photo.png';

export default {
  name: 'SysMenu',
  data() {
    return {
      collapsed: false,
      defaultActive: '',
      menusIcons: {
        1: manageImg,
        2: ApplyImg,
        3: DBImg,
        4: AIImg,
        5: baseImg,
        6: serverImg,
        7: photoImg,
        8: photoImg,
        9: timeImg,
      },
    };
  },
  props: {
    // 仅在页面渲染中使用 menus
    menuList: {
      type: Array,
      default: () => [],
    }
  },
  methods: {
    tabPlatform(data) {
      this.$emit('switchPlatform', data);
    },
    handleSelect(menuIndex, index) {
      this.$emit('on-select', [
        menuIndex,
        index,
      ]);
    }
  },
  watch: {

  },
  mounted() {
    // 暂时关掉
    // this.handleSelect(0, 0);
    // console.log(this.menuList)
  },
};
</script>
<style lang="scss" scoped>
.pedestal-sys-side-menu {
  .pedestal-icon{
    display: block;
    width: 22px;
    height: 22px;
  }
  cursor: pointer;
  position: absolute;
  left: 0;
  top: 60px;
  width: 366px;
  line-height: 24px;
  z-index: 9999;
  height: 829px;
  background-color: #fff;
  box-sizing: border-box;
  box-shadow:  8px 8px 31px 0 rgba(30,33,49,0.12);
  overflow-y: auto;
  .pedestal-menus {
    box-sizing: border-box;
    padding-top: 36px;
    // margin-bottom: -22px;
    .title {
      display: flex;
      height:22px;
      align-items: center;
      margin-bottom:26px;
      span{
        width: 3px;
        height: 15px;
        background:rgba(242,39,12,1);
        margin:0 8px 0 30px;
      }
      h6{
        font-size: 16px;
        font-weight: 500;
        color: #000;
        margin: 0;
      }
    }
    .pedestal-menus-box{
      .pedestal-menu-item{
        height:64px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        &:hover{
          background: rgba(249,249,249,1);
          border-right:3px solid rgba(242,39,12,1);
          color: rgba(242,39,12,1);
        }
        i{
          width: 24px;
          height: 24px;
          color: #fff;
          display: block;
          background-size: 100%;
          margin:0 12px 0 44px;
          &.BDP{
            background-image: url('./../../assets/images/newPortal/top/BDP.png');
          }
          &.API{
            background-image: url('./../../assets/images/newPortal/top/API.png');
          }
          &.CDP{
            background-image: url('./../../assets/images/newPortal/top/CDP.png');
          }
          &.DPC{
            background-image: url('./../../assets/images/newPortal/top/DPC.png');
          }
          &.Graph{
            background-image: url('./../../assets/images/newPortal/top/Graph.png');
          }
          &.Insight{
            background-image: url('./../../assets/images/newPortal/top/Insight.png');
          }
          &.LAP{
            background-image: url('./../../assets/images/newPortal/top/LAP.png');
          }
          &.NeuFoundry{
            background-image: url('./../../assets/images/newPortal/top/NeuFoundry.png');
          }
          &.Tag{
            background-image: url('./../../assets/images/newPortal/top/Tag.png');
          }
          &.UPath{
            background-image: url('./../../assets/images/newPortal/top/UPath.png');
          }
          &.DataFocus{
            background-image: url('./../../assets/images/newPortal/top/DataFocus.png');
          }
        }
        div{
          font-size: 14px;
          font-weight: 500;
          color: rgba(48,48,48,1);
          margin-right:8px;
        }
        p{
          font-size: 14px;
          font-weight: normal;
          color: rgba(48,48,48,1);
          margin:0;
        }
      }
    }
  }
}

</style>
