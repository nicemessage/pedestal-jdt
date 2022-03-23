// import { Message } from 'element-ui';

import {
  registerMicroApps,
  addGlobalUncaughtErrorHandler,
  setDefaultMountApp,
  start
} from 'qiankun';
import microActions from './microActions';
import masterActions from './masterActions';
import {
  platformGroupMap, menusFunTypeMap, menusGroupMap, menusNeedDelKeys
} from './config';


// const MSG_SUBAPP_REGISTER_ERROR = '系统注册失败，请稍后重试';
// const MSG_SUBAPP_LOADING_ERROR_ERROR = '资源脚本异常，请稍后重试';
// const MSG_SUBAPP_LOADING_NOFOUNT_ERROR = '资源未找到，请检查是否部署';
// const MSG_SUBAPP_DEFAULT_ERROR = '真抱歉！加载失败了，请稍后重试';
// const MSG_SYSTEM_FORBIDDEN = '没有权限访问';

// const showMessage = ({ showClose = true, message, type = 'error' } = {}) => {
//   Message({
//     showClose,
//     message: message || MSG_SUBAPP_REGISTER_ERROR,
//     type,
//   });
// };

function microRegisterApps(subApps) {
  // 这里拿到 app 以后就行去重操作
  for (let i = 0; i < subApps.length; i += 1) {
    subApps[i] = {
      ...subApps[i],
      container: '#sub-container',
      props: {
        routerBase: subApps[i].activeRule,
        microActions,
        subAppNodeId: subApps[i].id
      }
    };
  }

  registerMicroApps(subApps, {
    beforeLoad(app) {
      console.log(`before load: ${app.name}`);
      masterActions.isLoadingSubApp = true;
      return Promise.resolve();
    },
    beforeMount: [
      app => {
        console.log(`before mount: ${app.name}`);
        masterActions.eventCenter.restart()
        const subContainerDom =  document.getElementById('sub-container')
        if(subContainerDom){
          subContainerDom.childNodes[0].style.width = '100%';
          subContainerDom.childNodes[0].style.height = '100%';
        }
        return Promise.resolve();
      }
    ],
    afterMount: [
      app => {
        console.log(`after mount: ${app.name}`);
        masterActions.isLoadingSubApp = false;
        /**
         * 待优化：这个地方能拿到 app，拿到 app 以后能做很多事的
         */
        // if(app.name.indexOf('galaxy') > -1 ){
        //   setTimeout(() => {
        //     masterActions.eventBus.emit('SUBAPP_MOUNT', app)
        //   }, 400)
        // } else {
        //   masterActions.eventBus.emit('SUBAPP_MOUNT', app)
        // }
        return Promise.resolve();
      }
    ],
    beforeUnmount: [
      app => {
        masterActions.setGlobalState({
          beforeUnmountApp: {
            appName: app.name,
            routerBase: app.props.routerBase
          }
        })
        masterActions.eventCenter.restart()
        console.log(`before unmount: ${app.name}`);
        return Promise.resolve();
      }
    ],
    afterUnmount: [
      app => {
        console.log(`after unmount: ${app.name}`);
        return Promise.resolve();
      }
    ]
  });
  // 启动 qiankun


  let strictStyleOpt = false, 
      experimentalOpt = false

  if(localStorage.getItem('technology_test')){
    if(localStorage.getItem('technology_test') === '1002'){
      experimentalOpt = true
    } else if(localStorage.getItem('technology_test') === '1003'){
      strictStyleOpt = true
    } else if(localStorage.getItem('technology_test') === '1004'){
      experimentalOpt = strictStyleOpt = true
    }
  }

  start({
    prefetch: true,
    sandbox: {
      // 不可以开启
      experimentalStyleIsolation: experimentalOpt,
      strictStyleIsolation: strictStyleOpt
    },
    singular: true
    // getPublicPath,
  });
}

/**
 * 添加全局的未捕获异常处理器
 */
addGlobalUncaughtErrorHandler(event => {
  console.error(event);
});

export {
  start,
  setDefaultMountApp,
  microRegisterApps,
  platformGroupMap,
  menusFunTypeMap,
  menusGroupMap,
  menusNeedDelKeys
};
