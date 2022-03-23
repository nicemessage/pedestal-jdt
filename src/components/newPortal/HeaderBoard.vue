<template>
    <div class="pedestal-sys-header">
        <div class="pedestal-header-logo">
            <!-- 九宫格 -->
            <div class="pedestal-icon-wrap" @mouseover.stop="tabPlatform(true)" @mouseleave.stop="tabPlatform(false)">
              <i class="pedestal-icon pedestal-icon-dark-top"></i>
            </div>
            <div class="pedestal-logo-wrap">
              <div class="pedestal-logo-inner" @click="goToIndex">
                <img class="pedestal-logo" :src="dark.logo">
              </div>
              <p class="pedestal-logo-title">{{platFormName}}</p>
            </div>
        </div>

        <div class="pedestal-operate-area">
              <!-- 测试空间 select -->
              <div
                class="pedestal-test-area"
                v-if="0"
              >
                <el-select v-model="spaceValue" placeholder="测试空间">
                    <el-option
                      v-for="item in spaceOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                </el-select>
              </div>
              <ul class="pedestal-operate-area-list">
                <li
                  @click="openGateway(index)"
                  v-for="(item, index) in gatewayList"
                  :key="`gate${index}`"

                >
                  <!-- <i class="pedestal-icon" :class="item.icons"></i> -->
                  <span class="iconfont-portal" :class="item.icons"></span>

                   <!-- 啥时候有消息中心了再说 v-if="item.name.indexOf('消息中心') > -1" -->
                  <i
                   v-if="0"
                  ></i>
                </li>
              </ul>
              <!-- 用户 -->
              <user></user>
          </div>
    </div>
</template>
<script>
// import { mapGetters } from 'vuex';
import user from './User';
import http from '../../util/http';
import logo from '../../assets/images/newPortal/dark/logo.png';
import darkElIconTop from '../..//assets/images/newPortal/dark/el-icon-top.png';


export default {
  name: 'SysHeader',
  components: {
    user,
  },
  data() {
    return {
      dark: {
        logo,
        darkElIconTop,
      },
      activeName: '/',
      isActive: false,
      spaceOptions: [
        {
          value: '选项1',
          label: '黄金糕',
        },
        {
          value: '选项2',
          label: '双皮奶',
        }],
      spaceValue: '',
    };
  },
  computed: {
    isShowHamburger() {
      // TODO status处理
      // return this.userModuleInfo.filter((item) => item.status).length > 0;
      return this.userModuleInfo.length > 0;
    },
    // ...mapGetters([
    //   'sidebar',
    //   'userInfo',
    //   'userModuleInfo',
    //   'noticeNumber',
    //   'noticeList',
    // ]),
  },
  watch: {
    // eslint-disable-next-line func-names
    // '$route.path': function (val) {
    //   if (val === '/') {
    //     this.activeName = '/';
    //   } else if (val.indexOf('/auth/limitIndex') !== -1) {
    //     this.activeName = '/auth/limitIndex';
    //   } else if (val.indexOf('/jwf') !== -1) {
    //     this.activeName = '/jwf';
    //   } else {
    //     this.activeName = '';
    //   }
    // },
  },
  created() {
  },
  props: {
    platFormName: {
      type: String,
      default: '一站式数据开发与管理平台',
    },
    title: {
      type: String,
      default: '',
    },
    gatewayList: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  mounted() {
    // TODO 该页面需要强制登录
    // if (this.userInfo && this.userInfo.userId) {
    //
    // } else {
    //
    // }
  },
  methods: {
    goToIndex(){
      window.location.href = `${window.location.protocol}//${window.location.host}`
    },
    openGateway(index) {
      this.$emit('openGatewayTo', index);
    },
    tabPlatform(data) {
      this.$emit('switchPlatform', data);
    },
    getNoticeCount() {
      if (this.userInfo.pin) {
        http.post(`/notice/notification/msg/${this.userInfo.pin}`).then((res) => {
          if (res.stateCode === '3000') {
            // this.$store.dispatch('app/setNoticeNumber', res.data.count);
            // this.$store.dispatch('app/setNoticeList', res.data.countInfo);
          }
        });
      } else {
        http.post('/api/sys/query/user').then(({ rspData = {} }) => {
          http.post(`/notice/notification/msg/${rspData.pin}`).then((res) => {
            if (res.stateCode === '3000') {
              // this.$store.dispatch('app/setNoticeNumber', res.data.count);
              // this.$store.dispatch('app/setNoticeList', res.data.countInfo);
            }
          });
        });
      }
    },
    goDetail(noticeId) {
      this.isActive = false;
      this.$router.push({ path: '/noticeDetails', query: { id: noticeId } });
    },
  },
};
</script>
<style lang="scss" scoped>
.pedestal-sys-header{
  display: flex;
  justify-content: space-between;
  .pedestal-icon{
    display: block;
    width: 22px;
    height: 22px;
  }
  .pedestal-header-logo{
    display: flex;
    .pedestal-icon-wrap{
      cursor: pointer;
      .pedestal-icon-dark-top{
        margin: 20px;
        background-size: 100%;
        background-image: url('./../../assets/images/newPortal/dark/el-icon-top.png');
      }
    }
    .pedestal-logo-wrap{
      display: flex;
      padding-top:9px;
      .pedestal-logo-inner{
        cursor: pointer;
        padding-top:9px;
        height:42px;
        img.pedestal-logo{
          display: block;
          width: 34px;
          height: 25px;
          margin:0 12px 0 4px;
        }
      }
      p.pedestal-logo-title{
        padding-top:9px;
        font-size: 18px;
        line-height: 26px;
        font-weight: normal;
        color: #fff;
      }
    }
  }
  .pedestal-operate-area{
    width: 520px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .pedestal-test-area{
      width: 174px;
      margin-right:20px;
    }
    ul.pedestal-operate-area-list{
      display: flex;
      justify-content: center;
      margin: 0;
      li{
        width: 54px;
        list-style: none;
        margin: 0;
        padding: 0;
        position: relative;
        span{
          display: block;
          width: 22px;
          height: 22px;
          color: #fff;
          margin:0;
        }
        // .pedestal-icon-jd-author{
        //   background-size: 100%;
        //   background-image: url('./../../assets/images/newPortal/dark/el-icon-auth.png');
        // }
        // .pedestal-icon-jd-process{
        //   background-size: 100%;
        //   background-image: url('./../../assets/images/newPortal/dark/el-icon-process.png');
        // }
        // .pedestal-icon-jd-help{
        //   background-size: 100%;
        //   background-image: url('./../../assets/images/newPortal/dark/el-icon-help.png');
        // }
        // .pedestal-icon-jd-message{
        //   background-size: 100%;
        //   background-image: url('./../../assets/images/newPortal/dark/el-icon-message.png');
        // }
        i{
          position: absolute;
          right: 50%;
          top: 50%;
          margin-top: -2px;
          margin-right: -13px;
          display: block;
          width: 10px;
          height: 10px;
          background: rgba(242,39,12,1);
          border-radius: 50%;
        }
      }
      // 没生效
      // .el-input__inner{
      //   background: rgba(140,140,140,0.16);
      //   border-radius: 4px;
      // }
    }
  }
}


</style>
