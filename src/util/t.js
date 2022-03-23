const rootNode = {
  label: 'root',
  value: 'root',
  children: [
    {
      value: 'zhinan',
      label: '1指南',
      children: [
        {
          value: 'shejiyuanze',
          label: '1-1',
          children: [
            {
              value: '3yizhi',
              label: '1-1-1',
            },
          ],
        },
        {
          value: 'daohang',
          label: '1-2',
        },
      ],
    },
    {
      value: 'zujian',
      label: '2组件',
      children: [
        {
          value: 'basic',
          label: '2-1',
        },
        {
          value: 'form',
          label: '2-2',
        },
        {
          value: 'data',
          label: '2Data',
        },
      ],
    },
  ],
};
/**
 *思路
 * 1 第 1 遍历
 * 标识每个节点 true 或者 false
 * 建立父子关系
 * 把所有节点放在一个数组中；
 * 2，把 1 得到的数组，遍历，当前节点标识为 true 的，parent 也为 true，倒着遍历
 * 3，第 3 遍历
 * 所有没有 true 的节点都干掉
 * 4，数据格式整理成原来的数组
 * *******
 */

function deepFirstSearch(node, fn) {
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
          children[i].parent = item;
        }
      }
    }
  }
}

deepFirstSearch(rootNode, node => {
  console.log(node);
});
