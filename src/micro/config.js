
/**
 * 子项目本地开发 entry
 */
const subAppsDevEntry = {
  'auth': '//localhost:8000',
  // 'jwf': '//localhost:8001',
  // 'standard': '//localhost:8008',
  // 'newstandard': '//localhost:8038',
  // 'gaia': '//localhost:8006',
  // 'dataapi': '//localhost:1024',
  // 'map': '//localhost:8110',
  // 'ide': '//localhost:8112',
  // 'markete': '//localhost:8111',
  // 'galaxymain': '//localhost:8885',
  // 'galaxyoperation': '//localhost:8885',
  // 'galaxyintegration': '//localhost:8885',
  // 'agilebi': '//localhost:3001',
  // 'agileportal': '//localhost:3002',
}

/**
 * 平台分组
 */
const platformGroupMap = new Map([
  [1, '大数据平台'],
  [2, '数据服务'],
  [3, '数据应用'],
  [6, '基础服务中心']
]);

/**
 * 菜单类型
 * 菜单 1 'm'
 * 按钮 2 'b'
 * 页面 3 'p'
 */
const menusFunTypeMap = new Map([
  [1, 'menu'],
  [2, 'button'],
  [3, 'page']
]);

/**
 * 菜单分组
 * 0  默认不分组
 * 4  开发平台
 * 5  管理平台
 */
const menusGroupMap = new Map([
  [0, '默认不分组'],
  [4, '开发平台'],
  [5, '管理平台']
]);
const menusNeedDelKeys = [
  'componentStatus',
  'createdDate',
  'creatorErp',
  'dataStatus',
  'delStatus',
  'description',
  'endTime',
  'functionCode',
  'ids',
  'insert',
  'key',
  'likeKey',
  'modifiedDate',
  'modifiedErp',
  'page',
  'parentIds',
  'programId',
  'remark',
  'startTime',
  'token',
  'userCode'
];


// const menusNeedDelKeys = [
//   'componentStatus',
//   'createdDate',
//   'creatorErp',
//   'dataStatus',
//   'delStatus',
//   'description',
//   'endTime',
//   'functionCode',
//   'ids',
//   'insert',
//   'key',
//   'likeKey',
//   'modifiedDate',
//   'modifiedErp',
//   'page',
//   'parentIds',
//   'programId',
//   'remark',
//   'startTime',
//   'token',
//   'userCode'
// ];



/**
 * 定义全局状态管理数据模型
 * 用户信息
 * token
 * 点击目标节点
 * 点击节点对应的子项目节点
 * 点击节点对应的页面节点
 */

const globalStateType = {
  userInfo: {},
  token: {
    ocean_ticket: ''
  },
  treeRoot: {},
  subAppsList: [],
  targetTree: [],
  targetItem: {},
  targetSubApp: {
    extConfig: {
      name: ''
    }
  },
  changeSubApp: {},
  targetPageNode: {
    url: ''
  },
  beforeUnmountApp: {}
}


export {
  platformGroupMap, menusFunTypeMap, menusGroupMap, menusNeedDelKeys, globalStateType, subAppsDevEntry
};
