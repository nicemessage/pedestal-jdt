<template>
  <div>
      <!-- 没有 children 就是叶子节点 -->
      <el-menu-item
        v-if="!menuItem.children || !menuItem.children.length"
        :index="menuItem.idString"
        class="pedestal-leafnode-menu"
        :class="{ secondNodeMenu: !menuItem.firstNotChild}"
      >
        <i
          v-if="menuItem.icons"
          :class="['icon', 'iconfont', menuItem.icons]"
        ></i>
        <span slot="title">{{ menuItem.name }}</span>
      </el-menu-item>
      <!-- 有 children 就是分组节点 -->
      <el-submenu
        v-if="menuItem.children && menuItem.children.length"
        :index="menuItem.idString"
        class="pedestal-groupnode-menu"
      >
        <template 
          slot="title"
        >
          <i
            v-if="menuItem.icons"
            :class="['icon', 'iconfont', menuItem.icons]"
          ></i>
          <span slot="title">{{ menuItem.name }}</span>
        </template>
        <MenuItem
          v-for="item in menuItem.children"
          :key="item.idString"
          :menuItem = "item"
        ></MenuItem>
      </el-submenu>
      <!-- <div class="pedestal-group-line" v-if="menuItem.children && menuItem.children.length"></div> -->
  </div>
</template>

<script>
/**
 * @name 组件名
 * @author your name
 * @description 简单描述
 */
export default {
  name: 'MenuItem',
  components: {},
  props: {
    // 菜单列表
    menuItem: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      openedsItem: [],
    };
  }
};
</script>

<style lang="scss" scoped>
.icon {
  color: #fff;
  font-size: 20px;
}
.pedestal-group-line{
  width: 194px;
  height: 1px;
  background: rgba(239,239,239,1);
  margin:4px 0 4px 16px;
}
</style>
