// import Events from 'eventEmitter3';
// 这个通信 是 基座 和 子项目通信
import { initGlobalState } from 'qiankun';
import { cloneDeep } from 'lodash';
import tools from './tools';
import Events from './event';
import simpleEvent from './simpleEvent';
import { globalStateType } from './config';

let globalstate = globalStateType;
const masterActions = initGlobalState(globalstate);

// 我需要调用这个方法
masterActions.onGlobalStateChange(state => {
  // console.log(state, prev);
  globalstate = cloneDeep(state);
});

// 提供了 api ，建议只作为一个对象使用，且 value 都是非引用类型 strihg
masterActions.getGlobalstate = key => {
  const result = key ? globalstate[key] : globalstate;
  return result;
};

/**
 * 基座和子项目通过这个通信
 */
masterActions.eventCenter = new simpleEvent();
masterActions.microTools = tools;
// 这个 eventBus 是基座页面 和 公共子组件通信用的；
masterActions.eventBus = new Events();
masterActions.isLoadingSubApp = false

masterActions.install = Vue => {
  Vue.prototype.$microMaster = masterActions;
};

export default masterActions;
