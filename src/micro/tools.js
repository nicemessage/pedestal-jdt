import shortid from 'shortid';
import { platformGroupMap, menusGroupMap } from './config';

export default {
  // 广度优先遍历树，并建立父子关联关系
  traverAst(node, callBack) {
    const queue = [];
    const me = this;
    while (node !== undefined) {
      if (node.children && node.children.length > 0) {
        for (let i = 0; i < node.children.length; i += 1) {
          queue.push(node.children[i]);
          node.children[i].parent = node;
        }
      }
      callBack && callBack.apply(me, [node]);
      node = queue.shift();
    }
  },
  getQueryString(name) {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return decodeURIComponent(r[2]);
    };
    return null;
  },
  traverAstOnly(node, callBack) {
    const queue = [];
    const me = this;
    while (node !== undefined) {
      if (node.children && node.children.length > 0) {
        for (let i = 0; i < node.children.length; i += 1) {
          queue.push(node.children[i]);
        }
      }
      callBack && callBack.apply(me, [node]);
      node = queue.shift();
    }
  },
  nodeAddConfig(node, DICONFIGDATA){
    let nodeConfig
    /**
     * 优化项：平台 id 和 菜单 id 可能会重复
     * 如果 node 有 initId 属性，说明是平台节点，就从 platform_id 拿
     * 如果没有 initId 只有 id，说明是菜单 节点，直接从 id 拿
     */
    if(node.initId){
      nodeConfig = DICONFIGDATA.subAppsMap.get(`platform_${node.initId}`)
    } else if(node.id){
      nodeConfig = DICONFIGDATA.subAppsMap.get(`${node.id}`)
    }

    if(!nodeConfig) return;
    if(nodeConfig.path){
      node.url = nodeConfig.path
    }
    // if(nodeConfig.icons){
    //   node.icons = nodeConfig.icons
    // }
    if(nodeConfig.name && nodeConfig.activeRule){
      node.extConfig = {
        name: nodeConfig.name,
        activeRule: nodeConfig.activeRule,
        entry: nodeConfig.entry
      }
    }
  },
  /**
   * 参数是 /api/program/find/portalV2 接口返回数据
   * 前端根据业务需求，转换后端数据形成前端自有的数据模型
   * 数据转换要做以下的事情
   * 一，平台
   * 1，后端返回平台列表 以及 平台列表下挂的 子菜单，不在一个数据表中，因此平台节点 id 和 子菜单节点 id 可能冲突
   * 2，把 groupId 根据前后端约定转换成 groupName
   * 3，把平台节点的 children 定义为 functionList 字段；
   * 4，我之前用 moduleCode ，现在是平台的 groupId 对应的分组；新接口返回的 modulesCode 是配置平台的平台 id
   * 5，后端返回 modulesName 转成 enName 英文名
   * 6，前端要进行排序，后端不保证顺序；
   * 7，如果是门户虚拟节点 portalNoShow 为 true
   * 8，最后平台输出字段为 id、name、enName、sort、children、groupName、 预留（integrateMode、extConfig、url）
   *
   * 二，菜单节点
   * 1，子菜单关键字段：
   * 2，要根据菜单分组，建立父子映射关系 形成前端数据模型的树（只有一站式开发与管理平台涉及到）
   * 3，要把前后端约定好的，funtionType  1 菜单  2 按钮  3 页面 转成可读的 nodeType menu、btn、page
   * 4，最终输出字段
   * id、
   * extConfig、
   * name、
   * children、
   * icons、
   * url、
   * sort
   * funtionType
   * 预留（integrateMode、）
   *
   * 三，目标：经过数据转换后，每个字段都有价值，可读性更好，更好维护
   *
   */
  serverDataConvert(rspData, TREEROOT) {
    TREEROOT.children = [];

    const trueTree = {
      id: 'trueRoot',
      children: [],
      cacheChildren: []
    };

    // 循环遍历
    /**
     * 第一步，遍历平台节点，重新赋值，给平台分组进行分组
     */
    const menusChildren = trueTree.cacheChildren;
    for (const pItem of rspData.values()) {
      /**
       * groupId 不大于 0 就是脏数据
       */
      if(pItem.groupId > 0){
        // 新平台节点
        const newPItem = {
          id: shortid.generate(),
          initId: pItem.id,
          name: pItem.name,
          enName: pItem.modulesName,
          sort: pItem.sort,
          icons: pItem.icons,
          platformGroupName: platformGroupMap.get(pItem.groupId),
          groupId: pItem.groupId,
          deep: 2, // deep 为 0 的是平台节点
          url: pItem.url,
          // extConfig: pItem.extConfig, // 不从接口拿 extConfig
          integrateMode: pItem.integrateMode,
          noShow: pItem.modulesName === 'noshow', // 待完善
          cacheChildren: pItem.functionList,
          children: []
        };
        const groupChildren = [];
        // 遍历平台节点的 children ，对一级子菜单，进行分组；
        for (let i = 0; i < newPItem.cacheChildren.length; i += 1) {
          const activeFirstMenu = newPItem.cacheChildren[i];
          activeFirstMenu.fePortalNode = `code_${shortid.generate()}`;
          let firstMenuRoot = null;
          // 0 的话不用分组
          if (activeFirstMenu.groupId !== 0) {
            // 获取一级子菜单的组名
            const firstMenuGroupName = menusGroupMap.get(activeFirstMenu.groupId);
            for (let j = 0; j < groupChildren.length; j += 1) {
              if (groupChildren[j].name === firstMenuGroupName) {
                firstMenuRoot = groupChildren[j];
                break;
              }
            }
            if (firstMenuRoot) {
              firstMenuRoot.children.push(activeFirstMenu);
            } else {
              firstMenuRoot = {
                id: shortid.generate(),
                name: firstMenuGroupName,
                children: [activeFirstMenu],
                groupId: activeFirstMenu.groupId
              };
              groupChildren.push(firstMenuRoot);
            }
          } else {
            groupChildren.push(activeFirstMenu);
          }
        }
  
        newPItem.children = groupChildren;
        // 置为 undefined 释放内存
        newPItem.cacheChildren = undefined;
        menusChildren.push(newPItem);
      }
    }
    /**
     * 算法待优化，先实现
     * 第二步，把平台节点按照平台分组，转换成上下树形结构
     */
    const rootChildren = trueTree.children;
    for (const aItem of menusChildren.values()) {
      let rootChild = null;
      for (let i = 0; i < rootChildren.length; i += 1) {
        if (rootChildren[i].name === aItem.platformGroupName) {
          rootChild = rootChildren[i];
          break;
        }
      }
      if (rootChild) {
        rootChild.children.push(aItem);
      } else {
        rootChild = {
          id: shortid.generate(),
          name: aItem.platformGroupName,
          platformId: aItem.groupId,
          children: [aItem],
          deep: 1
        };
        rootChildren.push(rootChild);
      }
    }
    // 置为 undefined 释放内存
    trueTree.cacheChildren = undefined;
    TREEROOT.children = trueTree.children;
  },
  // 子应用列表去重
  subAppsClear(subApps) {
    const resultApps = [];
    for (let i = 0; i < subApps.length; i += 1) {
      // 去重操作，
      if (!resultApps.find(item => item.activeRule === subApps[i].activeRule)) {
        resultApps.push(subApps[i]);
      }
    }
    return resultApps;
  },
  getDataType(val) {
    return Object.prototype.toString.call(val).slice(8, -1);
  },
  // 1，如果没有 url 就去查当前节点的子系节点，直到查到子节点为止；
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
  getExtConfigByNodeByKey(node, key) {
    /**
     * 先从子系第一个节点找子项目，找到了直接返回
     */
    let result = node;
    while (!(result.extConfig && result.extConfig[key])) {
      if(result.children && this.getDataType(result.children) === 'Array' && result.children.length > 0){
        [result] = result.children;
      } else {
        result = undefined;
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
        break;
      }
    }
    return result;
  },
  // 深度优先遍历树
  deepFirstSearch(node, fn) {
    if (node != null) {
      const stack = [];
      stack.push(node);
      while (stack.length !== 0) {
        const item = stack.pop();
        fn(item);
        const { children } = item;
        if (children) {
          for (let i = children.length - 1; i >= 0; i--) {
            stack.push(children[i]);
          }
        }
      }
    }
  }
};
