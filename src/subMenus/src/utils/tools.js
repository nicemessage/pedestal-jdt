export default {
  existChildren(node){
    if(!node.children || (this.getDataType(node.children) === 'Array') && node.children.length === 0){
      return false;
    } else {
      return true;
    }
  },
  // 遍历树，并建立父子关联关系
  traverAst(node, callBack) {
    const queue = [];
    const me = this;
    while (node !== undefined) {
      if (node.children && node.children.length > 0) {
        for (let i = 0; i < node.children.length; i += 1) {
          queue.push(node.children[i]);
        }
      }
      if (callBack && callBack.apply(me, [node]) === 'break') {
        break;
      }
      node = queue.shift();
    }
  },
  getExtConfigByNodeByKey(node, key) {
    /**
     * 先从子系第一个节点找子项目，找到了直接返回
     */
    let result = node;
    while (!(result.extConfig && result.extConfig[key])) {
      if(result.children && this.getDataType(result.children) === 'Array' && result.children.length > 0){
        [result] = result.children;
      } else {
        result = undefined
        break;
      }
    }
    // 取到子项目信息，直接返回
    if(result) return result;
    /**
     * 子系第一个节点找不到子项目，再去父系节点找
    */
    result = node;
    while (!(result.extConfig && result.extConfig[key])) {
      if(result.parent){
        result = result.parent;
      } else {
        result = undefined;
        break
      }
    }
    return result;
  },
  /**
   * 直接刷新 url 的时候，需要查平台节点，展示公共子菜单
   * 
   * 要查找的有 2个东西
   * 1，有 fePortalNode, 这个是公共子菜单的父节点
   * 2，有 initId 的节点，这个是 平台节点
   */
   getFePortalNodeByParent(node, PLATFORMNODE) {
    /**
     *  1，先向父系节查找当前子项目的fePortalNode
     * */
    let result = node,
        menusParent = null,
        type = ''
        /**
         * 1，有 fePortalNode, 这个是公共子菜单的父节点
         */
        while (!result.fePortalNode) {
          if(result.parent){
            result = result.parent;
          } else {
            result = undefined
            break;
          }
        }
        if(result){
          menusParent = result;
          /**
           * 2，有 initId 的节点，这个是 平台节点
           */
          while (!result.initId) {
            if(result.parent){
              result = result.parent;
            } else {
              result = undefined
              break;
            }
          }
          /**
           * 1001 一站式开发管理平台
           * 1002 基础服务中心
           * 1003 非一站式、非基础服务中心的 其他平台；
           */
          if(result){
            if(result.initId === Number(PLATFORMNODE.oneStopId)){
              type = 1001
            } else if(result.initId === Number(PLATFORMNODE.basicServiceId)){
              type = 1002
            } else {
              type = 1003
            }
            return {
              type,
              menusParent,
              platFormNode: result
            }
          }
        }
  },
  /**
   * 节点类型 分组、页面、子项目、子项目+页面
   *  页面节点只有 node.url
   *  子项目节点   node.extConfig.activeRule
   *  子项目+页面  node.url 和 node.extConfig.activeRule都有
   *  分组 node.url 和 node.extConfig.activeRule 都没有
   */
  getNodeType(node) {
    const result = {
      type: '',
      node: {}
    };
    if (node.url) {
      // 点击的是页面 或 带页面的子项目直接返回
      if (node.extConfig && node.extConfig.activeRule) {
        result.type = 'subAppPage';
      } else {
        result.type = 'page';
      }
      result.node = node;
    }
    if (!node.url) {
      // 点击的是 子项目，加载子项目，子项目第一个页面
      if (node.extConfig && node.extConfig.activeRule) {
        result.type = 'subApp';
        result.node = node;
      } else {
        // 点击的是分组，按目前产品需求，不需要做任何改动；
        result.type = 'group';
      }
    }
    return result;
  },
  getDataType(val) {
    return Object.prototype.toString.call(val).slice(8, -1);
  },
  /**
   *
   * @param {*} node
   * @param {*} getUrl
   * @returns  有 flag 返回 url 没有的话 返回 item
   */
   getUrlNodeByChildren(node) {
    let result = node;
    while (!(this.getDataType(result.url) === 'String' && result.url.slice(0, 1) === '/')) {
      if (result.children) {
        [result] = result.children;
      } else {
        result = undefined
        break; // 没有 children 就停止，防止死循环
      }
    }
    return result;
  },
};
