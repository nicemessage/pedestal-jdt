<template>
    <div 
      class="pedestal-container"
      v-show="isLogin"
    >
        <div class="pedestal-header"  v-show="isShowHeader">
              <!-- 九宫格按钮 和 顶部右侧门户权限组件按钮在这里 -->
              <header-board v-if="1"
                @openGatewayTo="openGatewayTo"
                @switchPlatform="switchPlatform"
                :gatewayList="gatewayList"
                :platFormName="platFormName"
              >
              </header-board>
              <!-- 点击九宫格出现的白色菜单 -->
              <side-bar
                v-if="topMenusList.length > 0"
                v-show="platformStatus"
                @on-select="selectPlatform"
                @switchPlatform="switchPlatform"
                :menuList="topMenusList"
                >
              </side-bar>
        </div>

        <!-- 门户 header 以下 -->
        <div class="pedestal-bottom">
            <!-- 门户左侧黑色边栏 -->
            <div class="pedestal-aside-bar">
                <dl>
                  <!-- 开发平台 & 资产管理 -->
                  <dt v-if="showTabDevManage">
                    <div @click="tabDevManageTab">
                      <i class="pedestal-icon" :class="devManageIcon"></i>
                      <img :src="triangle">
                    </div>

                  </dt>
                  <!-- 门户左侧黑色边栏- -->
                  <dd class="pedestal-normal-item" v-for="(item, index) in mainAsideList"
                    :class="{'aside-current': index === curAsideIndex }"
                    :key="item.moduleCode" @click="goSubApp(item, index)">
                    <span class="iconfont-portal" :class="item.icons"></span>
                    <p>{{item.name}}</p>
                  </dd>
                </dl>
            </div>
            <div class="pedestal-main">
                <div class="pedestal-container-inner">
                  <!-- 公共子组件 -->
                  <tree-menus
                    id="tree-menus"
                  >
                  </tree-menus>
                  <div
                    id="sub-container"
                  >
                  </div>
                  <!-- <router-view class="wh"></router-view> -->
                </div>
                <!-- 400 500 错误 -->
                <!-- <div v-else class="wh">
                    <div v-show="appLoading" class="wh"
                          v-loading="true" element-loading-text="拼命加载中"/>
                    <div v-show="!appLoading" class="wh" v-html="appContent"></div>
                </div> -->
            </div>
        </div>


        <!-- 一站式开发与管理平台 开发 管理 弹框 -->
        <div 
          v-if="devManage.open" 
          @click="closeDevManagerMask" 
          class="pedestal-dev-mannager-mask"
        ></div>
        <dl v-if="devManage.open" class="pedestal-switch-dev-mannager">
          <dd class="devmanage-item"
              @click="tabDevManageItem(index)"
              v-for="(item, index) in devManage.list"
              :key="`dev_${index}`">
            <div class="dev-inner" :class="{cur: index === devManage.current}">
              <i class="pedestal-icon" :class="getDevManageIcon(index)"></i>
              <p>{{item.name}}</p>
            </div>
            <span :class="{cur: index == devManage.current}"></span>
          </dd>
        </dl>

        <!-- 首次打开指引 -->
        <div
          class="pedestal-first-mask"
          v-if="showGuideMask"
        >  
          <div class="pedestal-guide-devManage"></div>
          <div class="pedestal-guide-img">
            <div
              class="pedestal-guide-btn"
              @click="closeGuideMask"
            ></div>
          </div>
        </div>
    </div>
</template>

<script>
import * as Cookies from 'js-cookie';
import HeaderBoard from './HeaderBoard';
import SideBar from './SideBar';
import triangle from './Triangle@1x.png';

/**
 *  暂时这么写，最后要把这个文件 拿出来
 */
import diConfig from '../../diconfig/index.json'
import diConfigDev from '../../diconfig/dev_config.json'
import mockResData from '../../mock/server220104.json'


/**
 * 为了降低 菜单树遍历的复杂度，这个地方把 子项目节点、子项目页面节点 数据结构拍平
 */
const DICONFIGDATA = {
  domain: '',
  subAppsMap: new Map(),
  oneStopId: ''
}

// 以下是微基座的东西
import { microRegisterApps, menusFunTypeMap, menusGroupMap } from '../../micro/index';
import http from '../../util/http';
import { subAppsDevEntry } from '../../micro/config'
import Axios from 'axios';

let subAppInitInfo = {};
let SUBAPPSLIST = [];
const TREEROOT = {
  id: 'root',
  deep: 0,
  children: [],
};
// 基座的工具方法
let MICROTOOLS;

export default {
  name: 'LayoutBoard',
  data() {
    return {
      isLogin: false,
      showGuideMask: false,
      platFormName: '',
      urlPlatformId: -1,
      subContainerSize: {
        width: '',
        height: ''
      },
      gatewayList: [],
      isShowHeader: true,
      triangle,
      showTabDevManage: false,
      platformStatus: false,
      curAsideIndex: 0,
      devManage: {
        open: false,
        list: [],
        current: 0,
        menuList: [],
      },
      // 九宫格
      topMenusList: [],
      // 门户左侧黑条菜单
      mainAsideList: [],
      theme: '',
      activeSubAppName: '',
    };
  },
  watch:{
    platFormName(data){
      document.title = data;
    }
  },
  components: {
    HeaderBoard,
    SideBar
  },
  computed: {
    devManageIcon() {
      let result = '';
      if (this.devManage.current === 0) {
        result = 'pedestal-icon-jd-dev-platform-cur';
      } else {
        result = 'pedestal-icon-jd-manage-platform-cur';
      }
      return result;
    }
  },
  created() {
    // 判断用户登录没有
    if(Cookies.get('ocean_ticket')){
      this.isLogin = true;
    }

    MICROTOOLS = this.$microMaster.microTools;
    this.getMicroConfig()
  },
  mounted() {
    /**
     * 用户刷新页面，进入门户
     */
    this.$microMaster.eventBus.on('REFRESH_UPDATE', data => {
      if(!subAppInitInfo.targetSubApp){
        subAppInitInfo.targetSubApp = data.subAppInitInfo.targetSubApp
      }

      /**
       * 非一站式开发与管理平台
       * 更新 右上角 DI logo 右边的名字
       */
      if(data.type === 1002 || data.type === 1003){
        this.mainAsideList = data.platFormNode.children;

        this.curAsideIndex = this.mainAsideList.findIndex((item) => item.id === data.menusParent.id);
        if(this.mainAsideList && this.mainAsideList.length > 0){
          this.platFormName = this.mainAsideList[0].parent.name;
        }
      } else if(data.type === 1001){
        /**
         * 显示 开发、管理平台 的切换 tab 关闭状态
         * 显示 开发、管理的 正确 current
         * 显示 正确的 mainAsideList
         * 显示 正确的 curAsideIndex
         */ 
        let indexF, indexS
        indexF = this.topMenusList.findIndex((item) => item.id === data.platFormNode.parent.id)
        indexS = this.topMenusList[indexF].children.findIndex((item) => item.id === data.platFormNode.id)
        let devManageIndex = data.platFormNode.children.findIndex((item) => item.id === data.menusParent.parent.id);
        this.selectPlatform([indexF, indexS], {
          flag: true,
          devManageIndex
        });
        this.devManage.open = false
        this.curAsideIndex = this.mainAsideList.findIndex(item => item.id === data.menusParent.id) 
      }
    });

    /**
     * 用户点击 
     */
    this.$microMaster.eventBus.on('SUBAPP_OWN_JUMP', data => {
      if(this.mainAsideList && this.mainAsideList.length > 0){
        this.curAsideIndex = this.mainAsideList.findIndex(item => item.id === data.id);
      }
    })
  },
  methods: {
    closeDevManagerMask(){
      this.devManage.open = false;
    },
    closeGuideMask(){
      this.showGuideMask = false;
      localStorage.setItem('pedestal_not_first_open', true)
    },
    switchPlatform(data){
      if(localStorage.getItem('technology_test') && localStorage.getItem('technology_test') === '1001'){
         this.platformStatus = true
      } else {
        this.platformStatus = data;
      }
    },
    getMicroConfig(){
      if(process.env.NODE_ENV === 'development'){
        this.initDiConfig(diConfig)
      } else {
        return new Promise((resolve, reject) => {
          Axios.get(`/micro/config/index.json?id=${new Date().getTime()}`).then((response) => {
            /*** 配置文件数据整理，暂时写在这里，因为得根据用户区分
             * 临时方案，最后肯定会干掉的
             */
            this.initDiConfig(response.data)
          }).catch((err) => {
            console.error(err);
            reject(err);
          });
        });
      };
    },
    initDiConfig(data){
      let userDiConfig = data;
        /**
         * 把 测试配置文件的 子项目拿进来
         */
        userDiConfig.subApps = Object.assign(diConfigDev.subApps, userDiConfig.subApps);

        // DICONFIGDATA.domain = userDiConfig.domain.default;
        
        /**
         * 前端写死 一站式开发与管理平台的id，要干 2件事
         * 1，定义开发平台、管理平台的顺序
         * 2，用户点击的节点 向父系节点查找，找到这个节点，门户展示比较特殊
         *    （好像门户节点也比较特殊）
         */
        DICONFIGDATA.oneStopId = userDiConfig.platFormNode.oneStopId;
        DICONFIGDATA.basicServiceId = userDiConfig.platFormNode.basicServiceId;

        /**
         * 如果没有指定的 平台节点，那就指定一站式开发与管理平台
         */
        this.urlPlatformId = MICROTOOLS.getQueryString('platformId') ? MICROTOOLS.getQueryString('platformId') : DICONFIGDATA.oneStopId;

        if(!localStorage.getItem('pedestal_not_first_open') && this.urlPlatformId === DICONFIGDATA.oneStopId){
          this.showGuideMask = true;
        }

        for(let [key, val] of Object.entries(userDiConfig.subApps)){
          DICONFIGDATA.subAppsMap.set(key, val)
          if(val.pages){
            for(let [pkey, pval] of Object.entries(val.pages)){
              DICONFIGDATA.subAppsMap
                    .set(pkey, pval)
              }
          }
        }
        /**
         * 获取用户信息
         */
        this.getUserInfo();
        // this.serverHangMockData()
    },
    /**
     * uas 后端经常挂，挂的时候，mock 数据开发
     */
    serverHangMockData(){
      const rspData = mockResData.filter(item => item.versionId === 1)
      MICROTOOLS.serverDataConvert(rspData, TREEROOT);
      this.initTreeData()
    },
    // 获取用户信息
    getUserInfo() {
      return new Promise((relove, reject) => {
        http.post('/api/sys/query/user').then(({ rspData = {} }) => {
          // Cookies.set('userInfo', JSON.stringify(rspData), { domain: window.DOMAIN });
          /**
           * 全局状态：放入用户信息、cookie
           */
          this.$microMaster.setGlobalState({
            userInfo: rspData,
            token: {
              ocean_ticket: Cookies.get('ocean_ticket')
            }
          })
          this.$store.commit('updateUserInfo', rspData)
          this.getUserAuthTree();
          relove();
        }).catch((error) => {
          reject(error);
        });
      });
    },
    // 获取权限树
    getUserAuthTree() {
      /**
       * versionId 是由于 深海、DI 新门户 后端的数据库、表 在一块，通过这个字段区分
       */
      return new Promise((resolve, reject) => {
        http.post('/api/program/find/portalV2', {
          versionId: 1
        }).then(({ rspData = [] }) => {
          /**
           * 前端数据转换，形成新门户微前端架构底层的数据模型
           */
          rspData = rspData.filter(item => item.versionId === 1)
          MICROTOOLS.serverDataConvert(rspData, TREEROOT);
          this.initTreeData()
          resolve();
        }).catch((err) => {
          console.error(err);
          reject(err);
        });
      });
    },
    initTreeData() {
      // 把基础服务中心 和 其他拆开、 TREEROOT 还是总的根节点
      for (let i = 0; i < TREEROOT.children.length; i += 1) {
        // platformId 6 就是基础服务中心
        if (TREEROOT.children[i].platformId === 6) {
          this.gatewayList = TREEROOT.children[i].children[0].children;
        } else {
          this.topMenusList.push(TREEROOT.children[i])
        }
      }
      MICROTOOLS.traverAst(TREEROOT, node => {

        /**
         * deep 
         * 0 root 节点
         * 1 平台分组
         * 2，平台
         * 3，一级子菜单分组 （一站式开发与管理）
         * 4，一级子菜单 （门户左侧黑边）
         * 5，公共子菜单一级
         * 6，公共子菜单二级
         */
        if(node.deep === undefined){
          const deep = node.parent.deep;
          node.deep = deep + 1;
        }
        /**
         * 由于一站式开发与管理平台的特殊性，一站式开发与管理平台 的 开发平台、管理平台并没有顺序，所以这块需要前端写死
         */
        if(node.initId === Number(DICONFIGDATA.oneStopId)){
          node.children.sort((itemA, itemB) => { return itemA.groupId - itemB.groupId }) 
        }
        /**
         * 去掉按钮节点
         */
        if(node.functionType && node.functionType === 2){
          node.parent.children.splice(node.parent.children.findIndex(item => item.id === node.id), 1)
        }
        /**
         * 针对菜单节点
         * id、name、icons、integrateMode、url、extConfig、sort、menusGroup、menusFunType、children
         */
        if (node.functionName) {
          node.name = node.functionName;
          node.idString = `${node.id}`
          node.menusGroup = menusGroupMap.get(node.groupId);
          node.menusFunType = menusFunTypeMap.get(node.functionType);
          // 没用的字段置为 undefined
          node.modifiedDate = undefined;
          node.createdDate = undefined;
        }
        /***
         *  定义前端节点类型，从配置文件中拿
         * entry 不带 域名
         */
        MICROTOOLS.nodeAddConfig(node, DICONFIGDATA)
        /**
         * 定义前端节点类型
         * 有 只有 url 是页面节点
         * 有 url 有 activeRule 是子项目页面节点
         * 没有 url 有 activeRule 是子项目节点
         * 没有 url 没有 activeRule 是分组节点
         * feNodeType: page、subApp、subAppPage、group
         */
        node.feNodeType = '';
        if (node.url) {
        // 点击的是页面 或 带页面的子项目直接返回
          if (node.extConfig && node.extConfig.activeRule && node.extConfig.name) {
            node.feNodeType = 'subAppPage';
            this.addSubToList(node);
          } else {
            node.feNodeType = 'page';
          }
        }
        if (!node.url) {
          // 点击的是 子项目，加载子项目，子项目第一个页面
          if (node.extConfig && node.extConfig.activeRule) {
            node.feNodeType = 'subApp';
            this.addSubToList(node);
          } else {
            // 点击的是分组，按目前产品需求，不需要做任何改动；
            node.feNodeType = 'group';
          }
        }
      });
      console.log(TREEROOT);
      // 子应用去重
      SUBAPPSLIST = MICROTOOLS.subAppsClear(SUBAPPSLIST);
      // 基座注册所有子项目
      console.log(SUBAPPSLIST);
      /**
       * 本地开发模式的 SUBAPPSLIST
       */
      microRegisterApps(SUBAPPSLIST);
      /**
       * 全局状态，通过公共子菜单，根节点、子应用列表出来了
       */
      this.$microMaster.setGlobalState({
        subAppsList: SUBAPPSLIST,
        treeRoot: TREEROOT,
      })

      /**
       * url /pedestal 后边有字符串，不执行自动加载逻辑
       */
      if(window.location.pathname.split('/pedestal')[1].length > 1){
        return ;
      }

      /**
       * 如果 url 有传入的平台 id，执行加载
       * 直接刷新 url 有子项目加载的话，不执行此项
       */
      if(this.urlPlatformId && this.urlPlatformId !== -1){
        // 如果是基础服务中心
        if(Number(this.urlPlatformId) === Number(DICONFIGDATA.basicServiceId) && this.gatewayList.length > 0){
          this.openGatewayTo(0)
          return;
        }
        /**
         * 根据一个 指定的平台，展示门户边栏、展示公共子菜单、展示子项目、及子项目页面
         * 从这边过来的没有 基础服务中心
         * 获取以下信息：
         * 当前平台节点，是第几个大平台、第几个小平台
         */
        let platformNode, platformGroup, indexF, indexS

        MICROTOOLS.traverAst(TREEROOT, node => {
          if(node.initId === Number(this.urlPlatformId)){
            platformNode = node;
            platformGroup = node.parent;
            return 'break'
          }
        })
        if(this.topMenusList && this.topMenusList.length > 0){
          indexF = this.topMenusList.findIndex(item => item.id === platformGroup.id);
          indexS = this.topMenusList[indexF].children.findIndex(item => item.id === platformNode.id)
          this.selectPlatform([indexF, indexS])
        }
      }
    },
    // 把子项目放在列表里，准备注册
    addSubToList(node) {
      /**
       * 这块域名是动态的
       */
      if(Number(window.location.port) === 0){
        /**
         * 本地开发模式 subAppsDevEntry 配置文件有的才有
         */
        SUBAPPSLIST.push({
          name: node.extConfig.name,
          activeRule: node.extConfig.activeRule,
          entry: node.extConfig.entry.indexOf('//') > 0 ? node.extConfig.entry: `//${window.location.host}${node.extConfig.entry}`,
          id: node.id,
        });
      } else {
        if(subAppsDevEntry[node.extConfig.name]){
          SUBAPPSLIST.push({
            name: node.extConfig.name,
            activeRule: node.extConfig.activeRule,
            entry: `${subAppsDevEntry[node.extConfig.name]}${node.extConfig.entry}`,
            id: node.id,
          });
        }
      }
    },
    // 打开门户组件
    openGatewayTo(index) {
      /**
       * 门户组件特殊统一，可以这么写
       * 补个东西显示，基础服务中心
       */
      this.mainAsideList = this.gatewayList;
      this.curAsideIndex = index;
      this.showTabDevManage = false;
      const targetNode = this.gatewayList[index];
      if(targetNode && targetNode.parent && targetNode.parent.name){
        this.platFormName = targetNode.parent.name;
      }
      this.clickToLoadSubApp(targetNode, this.gatewayList);
    },
    // 点击右侧黑色边栏
    goSubApp(targetNode, index) {
      this.curAsideIndex = index;
      this.clickToLoadSubApp(targetNode, this.mainAsideList);
    },
    // 点击加载子项目
    clickToLoadSubApp(targetNode, childTree) {
      /**
       * 如果当前点击节点没有子节点，则不展示公共子菜单
       * 子应用加载区域，相应的加宽
       */
      let targetSubApp = MICROTOOLS.getExtConfigByNodeByKey(targetNode, 'activeRule');
      
      if(!targetSubApp){
        console.log('您点击的菜单还没有配置子项目，如果权限系统菜单修改、增加、删除 涉及到子项目、及子项目页面 请通知陈云飞修改配置文件')
        /**
         * 清空子项目容器
         */
        return ;
      }

      const pageTargetNode = MICROTOOLS.getUrlNodeByChildren(targetNode)

       
      /**
       * 基座统一跳转
       */
      let jumpUrl = `${targetSubApp.extConfig.activeRule}`
      if(pageTargetNode){
        jumpUrl = `${jumpUrl}${pageTargetNode.url}`
      }
      window.history.pushState({ portalPushState: true }, null, jumpUrl);
      

      subAppInitInfo = {
        targetNode,
        targetSubApp,
        targetTree: childTree
      };

      // 通过公共子菜单 切换
      this.$microMaster.eventBus.emit('UPDAT_EMENUS', subAppInitInfo);
    },
    tabDevManageTab() {
      this.devManage.open = !this.devManage.open;
    },
    // 切换 数据开发平台 、 数据管理平台
    tabDevManageItem(index, reflesh) {
      // 下边展示一级子菜案
      const defaultIndex = this.devManage.current;
      this.mainAsideList = this.devManage.menuList[index === -1 ? defaultIndex : index].children;
      if (index !== -1) {
        /**
         * 不为 -1 的话，说明是正常点击的
         */
        this.devManage.current = index;
        this.devManage.open = !this.devManage.open;
      }
      /**
       * 选择平台以后，此时 this.mainAsideList 已经是一个列表了，
       * 加载子系节点第一个子项目
       */
      if(this.mainAsideList.length > 0 && !reflesh){
        this.goSubApp(this.mainAsideList[0], 0)
      }
    },
    // 选择平台
    selectPlatform(data, reflesh) {
      const item = this.topMenusList[data[0]].children[data[1]];
      this.platFormName = item.name;

      this.showTabDevManage = item.initId === Number(DICONFIGDATA.oneStopId);
      this.platformStatus = false;
    
      if (this.showTabDevManage) {
        /**
         * 是开发平台 & 管理平台 的话，自动执行一下 切换平台
         */
        this.devManage.list = this.devManage.menuList = this.topMenusList[data[0]].children[data[1]].children;
        let index = -1
        /**
         * 直接刷新 url 也可以执行到这里
         */
        if(reflesh && reflesh.flag) index = reflesh.devManageIndex;
        /**
         * 本地开发需要，本地静态 nginx 和 测试环境启动加载
         */
        // if(window.location.host === 'local.101bank.sh' || window.location.host === 'diweb.101bank.sh'){
          this.tabDevManageItem(index, reflesh);
        // }
      } else {
        this.mainAsideList = this.topMenusList[data[0]].children[data[1]].children;
        /**
         * 选择平台以后，此时 this.mainAsideList 已经是一个列表了，
         * 加载子系节点第一个子项目
         */
        if(this.mainAsideList.length > 0 && !reflesh){
          this.goSubApp(this.mainAsideList[0], 0)
        }
      }
    },
    getDevManageIcon(index) {
      let result = '';
      if (index === 0) {
        if (this.devManage.current === 0) {
          result = 'pedestal-icon-jd-dev-platform-cur';
        } else {
          result = 'pedestal-icon-jd-dev-platform';
        }
      } else if (index === 1) {
        if (this.devManage.current === 1) {
          result = 'pedestal-icon-jd-manage-platform-cur';
        } else {
          result = 'pedestal-icon-jd-manage-platform';
        }
      }
      return result;
    }
  },
};
</script>
<style lang="scss" scoped>
  $color: rgba(255,255,255,1);
  $background: rgba(33,33,33,1);

  .pedestal-container{
    position: relative;
    .pedestal-icon{
      display: block;
      width: 22px;
      height: 22px;
    }
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    .pedestal-header{
      width:100%;
      height: 60px;
      padding:0;
      background-color: $background;
    }
    .pedestal-bottom{
      height: calc(100vh - 60px);
      width: 100%;
      display: flex;
      background: #ebebec;
      .pedestal-aside-bar{
        width: 64px;
        min-width: 64px;
        background-color: $background;
        dl{
          cursor: pointer;
          dt{
            display: flex;
            height:46px;
            background: rgba(61,61,61,1);
            position: relative;
            div{
              display: flex;
              align-items: center;
              .pedestal-icon{
                  margin:0 6px 0 21px;
              }
              img{
                display: block;
                width:8px;
                height: 4px;
              }
            }
            .pedestal-icon-jd-dev-platform-cur{
                  background-size: 100%;
background-image: url('./../../assets/images/newPortal/dark/el-icon-devPlatform_cur.png');
            }
            .pedestal-icon-jd-dev-platform{
                  background-size: 100%;
background-image: url('./../../assets/images/newPortal/dark/el-icon-devPlatform.png');
            }
            .pedestal-icon-jd-manage-platform{
                  background-size: 100%;
background-image: url('./../../assets/images/newPortal/dark/el-icon-zichanguanli.png');
            }
            .pedestal-icon-jd-manage-platform-cur{
                  background-size: 100%;
background-image: url('./../../assets/images/newPortal/dark/el-icon-zichanguanli-current.png');
            }
          }
          }
          dd.pedestal-normal-item{
            height: 69px;
            padding-top:14px;
            box-sizing: border-box;
            &.aside-current{
              background: rgba(242,39,12,1);
            }
            span{
              display: block;
              width: 22px;
              height: 22px;
              color: #fff;
              margin:0 auto 6px;
            }
            p{
              color:#fff;
              font-size: 12px;
              text-align: center;
            }
          }
      }
    }

    .pedestal-dev-mannager-mask{
      width:100vw;
      height: 100vh;
      position: fixed;
      left: 0;
      top:0 ;
      background: rgba(0,0,0,0);
      z-index: 8;
    }
     dl.pedestal-switch-dev-mannager{
        position: absolute;
        left:0;
        top:106px;
        width: 147px;
        height: 98px;
        z-index: 9;
        background: rgba(48,48,48,1);
        box-shadow:  0 2px 6px 0 rgba(0,0,0,0.3);
        box-sizing: border-box;
        dd{
          display: flex;
          margin-left:10px;
          align-items: center;
          margin-top:10px;
          div{
            width: 104px;
            height: 34px;
            display: flex;
            align-items: center;
            &:hover{
              background: rgba(61,61,61,1);
              border-radius: 2px;
            }
            &.cur{
              background: rgba(61,61,61,1);
              border-radius: 2px;
            }
            i{
              margin:0px 11px 0 12px;
            }
            .pedestal-icon-jd-dev-platform-cur{
                  background-size: 100%;
background-image: url('./../../assets/images/newPortal/dark/el-icon-devPlatform_cur.png');
            }
            .pedestal-icon-jd-dev-platform{
                  background-size: 100%;
background-image: url('./../../assets/images/newPortal/dark/el-icon-devPlatform.png');
            }
            .pedestal-icon-jd-manage-platform{
                  background-size: 100%;
background-image: url('./../../assets/images/newPortal/dark/el-icon-zichanguanli.png');
            }
            .pedestal-icon-jd-manage-platform-cur{
                  background-size: 100%;
background-image: url('./../../assets/images/newPortal/dark/el-icon-zichanguanli-current.png');
            }
            p{
              color: #fff;
              font-size: 12px;
            }
          }
          span{
            width:13px;
            height:14px;
            display: block;
            background-size: 100%;
            margin:10px;

            &.cur{
background-image: url('./../../assets/images/newPortal/dark/el-icon-current.png');
            }
background-image: url('./../../assets/images/newPortal/dark/el-icon-notCurrent.png');
          }
        }
     }
    .pedestal-main{
      flex: 0 1 auto;
      width: 100%;
      overflow: hidden;
      .pedestal-container-inner{
        width: 100%;
        height: 100%;
        display: flex;
        position: relative;
        #sub-container{
          flex: 0 1 auto;
          // border: 2px solid red;
          width: 100%;
          // margin-top: 10px;
          // height: calc(100vh - 80px);
          overflow: hidden;
          position: relative;
        }
      }
    }
    .pedestal-first-mask{
      position: fixed;
      left: 0;
      bottom: 0;
      z-index: 99999;
      width: 100%;
      height: 100%;
      background: rgba(10,18,35,.5);
      .pedestal-guide-devManage{
        position: absolute;
        width: 147px;
        height: 150px;
        left: 0px;
        top: 60px;
        background-size: 100% 100%;
background-image: url('./../../assets/images/newPortal/dark/guide_img_devManage.png');
      }
      .pedestal-guide-img{
        position: absolute;
        width: 430px;
        height: 129px;
        left: 157px;
        top: 173px;
        background-size: 100%;
background-image: url('./../../assets/images/newPortal/dark/guide_img.png');
        .pedestal-guide-btn{
          position: absolute;
          width: 84px;
          height:42px;
          right: 0;
          bottom: 0;
        }
      }
    }
  }
</style>
