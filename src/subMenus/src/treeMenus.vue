<template>
<!-- <div class="wrap"> -->
    <!-- <el-tree
      :data="menusTree"
      @node-click="handleNodeClick"
      default-expand-all
      v-if="menusTree.length > 0"
    ></el-tree> -->
   <div 
    class="pedestal-sub-menus" 
    :class="{'is-close': isCollapse}"
     v-if="menusTree.length > 0"
  >
    <div class="close-but" @click="collapsHand">
        <i class="el-icon-arrow-left icons"></i>
    </div>
    <div class="pedestal-menu-list-wrap">
      <el-menu
        class="pedestal-menu-list"
        :text-color="theme.textColor"
        :active-text-color="theme.activeTextColor"
        :default-active="targetPageIdString"
        :router="false"
        :collapse="false"
        :default-openeds="openedsItem"
        @select="handleMenuClick"
      >
        <MenuItem 
          v-for="item in menusTree"
          :key="item.idString"
          :menuItem = "item"
        ></MenuItem>
      </el-menu>
    </div>
 </div>
<!-- </div> -->
</template>

<script>
import MICROTOOLS from './utils/tools';
import MenuItem from './MenuItem/index.vue';

import diConfig from '../../diconfig/index.json'
const PLATFORMNODE = diConfig.platFormNode;

/**
 *  SUBAPPINFO  输入参数
 *    targetNode 点击目标菜单，默认点击节点
 *    targetSubApp  当前目标子项目
 *    subAppsList 应用列表
 */
const SUBAPPINFO = {
  targetNode: {},
  targetSubApp: {},
  targetPageNode: {},
  subAppsList: [],
  treeRoot: {},
  menusParentNode: {}
};


export default {
  name: 'treeMenus',
  data() {
    return {
      showTree: true,
      menusTree: [],
      targetPageIdString: '',
      currentRouterPath: '',
      openedsItem: [], // 别整个赋值 menusTree，会导致不可预知的bug
      isCollapse: false,
    };
  },
  components: {
    MenuItem
  },
  props: {
    subAppName: {
      default: 'I am is subApp',
      type: String,
    },
    // 主题颜色
    theme: {
      type: Object,
      default: () => ({
        bgColor: '#fff',
        textColor: 'rgba(48,48,48,1)',
        // backgroundColor: "rgba(0,0,0,.1)",
        activeTextColor: '#f2270c'
      }),
    }
  },
  watch: {
    menusTree(data){
      MICROTOOLS.traverAst({ id : 'childRoot', children : data}, (node) => {
        if(MICROTOOLS.existChildren(node)){
          this.openedsItem.push(node.idString)
        }
      })
      for(let menuItem of data){      
        if(!MICROTOOLS.existChildren(menuItem)){
            menuItem.firstNotChild = true;
        } else {
            menuItem.firstNotChild = false;
        }
      }
    }
  },
  created() {
    /**
     * 通知公共子菜单 应用列表 根节点
     */
    this.$microMaster.onGlobalStateChange((state, prev) => {
      /**
       * 第一次声明 state.treeRoot 的时候触发
       */
      if(state.treeRoot.id && (!prev.treeRoot.id)){
        SUBAPPINFO.treeRoot = state.treeRoot;
        SUBAPPINFO.subAppsList = state.subAppsList;
        // 拿到树再执行
        this.initTreeMenus();
      }
    })

    /**
     * 检测到 路由变化，重新显示 公共子菜单、基座左边栏的 高亮选中状态
     */

    // if(localStorage.getItem('technology_test') && localStorage.getItem('technology_test') === '1005'){
        window.addEventListener('popstate', (event) => {

          /**
           * 从 localStorage 取值  pedestal_active_popstate 
           *  
           */
          if(new Date().getTime() - Number(localStorage.getItem('pedestal_active_popstate')) < 1200) return;
          if(event.state && event.state.portalPushState) return;

          console.log(new Date().getTime() - Number(localStorage.getItem('pedestal_active_popstate')))
          // console.log(1004)

          let routerPath = window.location.pathname
          if(!SUBAPPINFO.targetSubApp.extConfig) return;
          routerPath = routerPath.split(SUBAPPINFO.targetSubApp.extConfig.activeRule)[1];
          if(!routerPath || routerPath.indexOf('/') < 0) return;

          const { treeRoot } = SUBAPPINFO;
          const context = this;
          MICROTOOLS.traverAst(treeRoot , (node) => {
            if (node.url && node.url !== '/' && routerPath.indexOf(node.url) === 0) {

              if(node.fePortalNode){
                /**
                 * 如果跳转到平台节点, 通知基座 
                */
                context.$microMaster.eventBus.emit('SUBAPP_OWN_JUMP', {
                  id: node.id
                });
                if(!MICROTOOLS.existChildren(node)){
                  context.menusTree = []
                }
              } else {
                /**
                 * 得判断是，这当前公共子菜单的 还是 其他公共子菜单的
                 */
                context.targetPageIdString = node.idString
                if(!SUBAPPINFO.menusParentNode.id) return ;
                while (!node.fePortalNode) {
                  if(node.parent){
                    node = node.parent
                  } else {
                    node = undefined
                    break;
                  }
                }
                /**
                 * 不是同一个子菜单
                 * 更换公共子菜单，通知基座更新 边栏
                 */
                if(node.id !== SUBAPPINFO.menusParentNode.id){
                  if(MICROTOOLS.existChildren(node)){
                    context.menusTree = node.children;
                    SUBAPPINFO.menusParentNode = node;
                    context.$microMaster.eventBus.emit('SUBAPP_OWN_JUMP', {
                      id: node.id
                    });
                  } else {
                    context.menusTree = []
                    SUBAPPINFO.menusParentNode = {}
                  }
                }
              }
              return 'break';
            }
          })
        });
    // }

    /**
     *  门户 2个黑边点击通知 供给子菜单
     * 当前节点 、当前子项目、当前子树
     * */
    this.$microMaster.eventBus.on('UPDAT_EMENUS', data => {
      SUBAPPINFO.targetNode = data.targetNode;
      // 基座点击过来的，已经加载了子项目了
      SUBAPPINFO.targetSubApp = data.targetSubApp;
      // 点击了
      this.portalClickToChange();
    });

  },
  methods: {
    /**
     * 菜单点击事件
     */
    handleMenuClick(...args){
      //遍历公共子菜单树，获取 node
      MICROTOOLS.traverAst({ id : 'childRoot', children : this.menusTree}, (node) => {
        if (node.idString === args[0]) {
          this.handleNodeClick(node);
          return 'break';
        }
      })
    },
    // 点击基座触发
    portalClickToChange() {
      if (SUBAPPINFO.targetNode) {
        if(SUBAPPINFO.targetNode.children){
          this.menusTree = SUBAPPINFO.targetNode.children;
          SUBAPPINFO.menusParentNode = SUBAPPINFO.targetNode;
        } else {
          this.menusTree = []
          SUBAPPINFO.menusParentNode = {}
        }
        /**
         * 子项目名称
         * 子项目 activeRule
         * 当前点击，触发跳转的 url
         */
        /**
         * 判断当前页面有没有 url，没有 url 就是个分组节点，接着去查它的子节点，直到查到子节点为止
         * 找到 url 之后，查看当前节点 有没有
         */
        const targetUrlNode = MICROTOOLS.getUrlNodeByChildren(SUBAPPINFO.targetNode);
        if(targetUrlNode){
          SUBAPPINFO.targetPageNode = targetUrlNode;
          this.targetPageIdString = targetUrlNode.idString;
        }
      }
    },
    // 直接刷新 url 进入
    initTreeMenus() {
      let subAppNode;
      let subAppActivePath;
      
      /**
       * 从 window 上 拿  path 分析
       */
      const subAppPath = window.location.pathname;

      const { subAppsList } = SUBAPPINFO;
      for (let i = 0; i < subAppsList.length; i += 1) {
        // 拿到 当前子项目
        if (subAppPath.indexOf(subAppsList[i].activeRule) === 0) {
          subAppNode = subAppsList[i];
          subAppActivePath = subAppPath.split(subAppNode.activeRule);
          break;
        }
      }
      if (!subAppNode) return;

      /**
       * 如果有 subAppRouterPath ，就从 subAppRouterPath 先上查找
       * 如果没有 按之前的用 子项目区查
       * 如果产品要在 新门户把同一个 子项目页面挂载 2 遍，那也没招
       */

      const { treeRoot } = SUBAPPINFO;


      
      if(subAppActivePath && subAppActivePath.length > 1 && subAppActivePath[1]){
        /**
         * url 上边有子项目页面，就从 子项目页面找
         */
        MICROTOOLS.traverAst(treeRoot, (node) => {
          if (node.url && node.url === subAppActivePath[1]) {
            SUBAPPINFO.targetSubApp = MICROTOOLS.getExtConfigByNodeByKey(node, 'activeRule');
            SUBAPPINFO.targetPageNode = node;
            SUBAPPINFO.targetNode = node;
            this.targetPageIdString =  node.idString;
            return 'break';
          }
        });
        /**
         * 去 url 的 path 查，查不到的话，再用 子项目标识 去查询
         */
        if(SUBAPPINFO.targetSubApp && !SUBAPPINFO.targetSubApp.id){
          MICROTOOLS.traverAst(treeRoot, (node) => {
            if (node.id === subAppNode.id) {
              SUBAPPINFO.targetSubApp = node;
              SUBAPPINFO.targetNode = node;
              // this.targetPageIdString =  node.idString;
              // console.log(this.targetPageIdString)
              return 'break';
            }
          });
        }
      } else {
      /*
       * 这种情况很少
       * 如果没有子项目页面，就试试 子项目查 
       */
        MICROTOOLS.traverAst(treeRoot, (node) => {
          if (node.id === subAppNode.id) {
            SUBAPPINFO.targetSubApp = node;
            SUBAPPINFO.targetNode = node;
            this.targetPageIdString =  node.idString;
            return 'break';
          }
        });
      }
      /**
       * 拿到 子项目节点以后，通过 getFePortalNodeByParent 方法获取
       * type 一站式、门户组件、其他
       * platFormNode  ，左侧黑边 列表的父级
       * menusParent 公共子菜单的父级
       *   menusParent 特征，platFormNode 的一级子节点，公共子菜单的父节点
       */
      if(SUBAPPINFO.targetSubApp){

        let getFeResult
        if(SUBAPPINFO.targetSubApp.initId){
          getFeResult = {
            type: 1003,
            platFormNode: SUBAPPINFO.targetSubApp,
            menusParent: {}
          }

          let result = SUBAPPINFO.targetNode;

          while (!result.fePortalNode) {
            if(result.parent){
              result = result.parent;
            } else {
              result = undefined
              break;
            }
          }
          getFeResult.menusParent = result ? result: {}
          
        } else {
          getFeResult = MICROTOOLS.getFePortalNodeByParent(SUBAPPINFO.targetSubApp, PLATFORMNODE);
        }
        if(getFeResult.menusParent){
          SUBAPPINFO.menusParentNode = getFeResult.menusParent;
        }

        /**
         * 公共子菜单，通过基座 切换基座的黑边
         */
        if(getFeResult && getFeResult.type && getFeResult.platFormNode && getFeResult.menusParent){
          getFeResult.subAppInitInfo = SUBAPPINFO;
          this.$microMaster.eventBus.emit('REFRESH_UPDATE', getFeResult);
        }
      }

      /**
       * 如果公共子菜单父级没有 children 
       */
      
      if(!MICROTOOLS.existChildren(SUBAPPINFO.menusParentNode)){
        this.menusTree = [] 
        SUBAPPINFO.menusParentNode = {}
      } else {
        this.menusTree = SUBAPPINFO.menusParentNode.children;
      }
    },
    handleNodeClick(node) {
      /**
       * 前端节点类型
       * 页面： page
       * 子项目 + 页面： subAppPage
       * 子项目：subApp
       * 分组：group
       */
      /**
       * targetNode 当前点击节点
       * targetSubApp 当前点击节点的子项目节点
       * targetPageNode 当前节点节点的页面节点
       */
      if(!(SUBAPPINFO.targetSubApp && SUBAPPINFO.targetSubApp.extConfig && SUBAPPINFO.targetSubApp.extConfig.activeRule)) return;
      
      SUBAPPINFO.targetNode = node;
      SUBAPPINFO.targetSubApp = MICROTOOLS.getExtConfigByNodeByKey(node, 'activeRule');
      SUBAPPINFO.targetPageNode = MICROTOOLS.getUrlNodeByChildren(node);
      if(!SUBAPPINFO.targetSubApp){
        console.log('您点击的菜单还没有配置子项目，如果权限系统菜单修改、增加、删除 涉及到子项目、及子项目页面 请通知陈云飞修改配置文件')
        return ;
      }
      
      if(SUBAPPINFO.targetPageNode && SUBAPPINFO.targetPageNode.idString){
        this.targetPageIdString = SUBAPPINFO.targetPageNode.idString;
      }

      if(node.feNodeType === 'group'){
        return;
      }
      
      /**
       * 基座统一跳转
       */
      let jumpUrl = `${SUBAPPINFO.targetSubApp.extConfig.activeRule}`
      if(SUBAPPINFO.targetPageNode){
        jumpUrl = `${jumpUrl}${SUBAPPINFO.targetPageNode.url}`
      }
      window.history.pushState({ portalPushState: true }, null, jumpUrl);
    },
    /**
     * 点击向右，关闭
     */
    collapsHand() {
      this.isCollapse = !this.isCollapse;
    }
  },
};
</script>

<style lang="scss" scoped>
.pedestal-sub-menus {
  width: 210px;
  background: #fff;
  position: relative;
  transition: all 0.3s;
  box-sizing: border-box;
  &.is-close {
    width: 0px;
    .close-but .icons {
      transform: rotateZ(180deg);
    }
  }
  ::v-deep {
    .el-menu {
      border-right:0 none !important
    }
  }
  .close-but {
    position: absolute;
    height: 64px;
    right: -12px;
    width: 12px;
    top: 40%;
    z-index: 9;
    transform: translateY(-50%);
    background: #bbb;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    filter: drop-shadow(3px 0 3px #bbb);
    &:before{
      left: 0px;
      content: '';
      position: absolute;
      width: 0px;
      height: 0px;
      top: -12px;
      border: 12px solid;
      border-color: transparent transparent transparent #bbb;
    }
    &::after{
      content: '';
      left: 0px;
      position: absolute;
      width: 0px;
      height: 0px;
      bottom: -12px;
      border: 12px solid;
      border-color: transparent transparent transparent #bbb;
    }
    .icons {
      color: #fff;
      transform: translateX(1px);
      font-size: 14px;
    }
  }
  .pedestal-menu-list-wrap{
    width:210px;
    height: calc(100vh - 62px);
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
    &::-webkit-scrollbar {
      display: none; /* Chrome Safari */
    }
    overflow-y:auto;
  }
  .pedestal-menu-list {
    width: 210px;
    overflow: hidden;
    padding-top: 6px;
    ::v-deep {
      .pedestal-leafnode-menu{
        padding-left:16px !important;
        font-size: 13px!important;
        margin-bottom: 4px!important;
        &.is-active{
          background: rgba(249,249,249,1) !important;
          color: #F2270C !important;
          border-right: 3px solid #F2270C;
        }
        &:hover {
          background: rgba(249,249,249,1) !important;
          color: #F2270C !important;
        }
        &.secondNodeMenu{
          padding-left:26px !important;
        }
      };
      .pedestal-groupnode-menu{
        .el-submenu__title{
          position: relative;
          padding-left:16px !important;
          font-size: 12px !important;
          color: rgba(116,116,116,1) !important;
          margin-bottom: 4px!important;
          &:hover {
            background: rgba(249,249,249,1) !important;
            color: #F2270C !important;
          }
          .el-submenu__icon-arrow{
            position: absolute;
            top: 50%;
            margin-top: -3px;
            right: 16px;
            width: 9px!important;
            height: 5px!important;
            display: block!important;
            background-size: 100% 100%!important;
  background-image: url('./../../assets/images/newPortal/arrow/arrow_down.png')!important;
            &:before {
              content: "";
            }
          }
        }
      }
  }
  .menu-collapse {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 25px;
    border-top: 1px solid rgba(235, 194, 194, 0.5);
    cursor: pointer;
  }
  }
}


</style>
