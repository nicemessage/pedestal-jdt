
import treeMenus from './src/treeMenus';


treeMenus.install = (Vue) => {
  Vue.component(`${treeMenus.name}`, treeMenus);
};

export default treeMenus;
