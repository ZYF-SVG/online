<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt="" />
        <span> Vue-cli 后台管理界面 </span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 内容区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="this.isCollapse ? '64px' : '200px'">
        <!-- 折叠按钮 -->
        <div class="toggle-button" @click="toggleCollapse"> <p>|||</p> </div>
        <!-- 侧边菜单 --> 
        <el-menu  background-color="#323743" text-color="#fff" active-text-color="#74D3EA" 
        unique-opened :collapse="isCollapse" :collapse-transition="false" :router="true"
        :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">

            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文字 -->
              <span> {{ item.authName }} </span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + children.path" v-for="children in item.children" 
            :key="children.id" @click="saveNavState('/' + children.path)">
               <!-- 图标 -->
              <i class="el-icon-menu"></i>
              <!-- 文字 -->
              <span> {{ children.authName }} </span>
            </el-menu-item>
            
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体区域 -->
      <el-main>
        <router-view>
          <template> </template>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      // 存放字体图标
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      // 点击展开折叠按钮，改变的 布尔值
      isCollapse: false,
      // 存储 激活的菜单选项
      activePath: ''
    }
  },
  //  声明周期函数，程序初始化就执行
  created() { 
    this.getMenuList();
    // 初始化时，就从 本地存储 中拿取数据，更改 激活变量 的值，页面一刷新就有选中的状态了。
    this.activePath = window.sessionStorage.getItem('activePath');  
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    // 获取左侧菜单数据
    async getMenuList() {
      const { data : res } = await this.$http.get('menus');
      if (res.meta.status !== 200) return this.$message.error('获取菜单数据失败！');
        this.menulist = res.data;
    },
    // 点击折叠展开菜单
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;  // 取反    transform: rotate(90deg);
    },
    // 单击二级菜单时，触发
    saveNavState(path) {
      // 把当前这个值，触发到 本地存储 中
      window.sessionStorage.setItem('activePath', path);
      // 点击同时，设置为当前为激活状态
      this.activePath = path;
      // 注意，设置高亮的值要带 / 
    }
  }
};
</script>

<style lang="less" scoped>
// element-ui 的标签可以当做 类 来修饰
.home-container {
  height: 100%;
}
//  头部
.el-header {
  display: flex;
  justify-content: space-between;
  background-color: #3a3d40;
  align-items: center;
  >div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    img {
      width: 150px;
      padding-top: 10px;
    }
    span {
      color: #fff;
      font-size: 20px;
      letter-spacing: 2px;
    }
  }
}
// 侧边栏
.el-aside {
  background-color: #323743;
  transition: all .5s;
  .el-menu {
    border: none;
  }
}
// 右侧主体区域
.el-main {
  background-color: #e6eaec;
}
// 字体图标
.iconfont {
  font-size: 18px;
  margin-right: 5px;
}
// 折叠按钮
.toggle-button {
  background-color: #4a5064;
  color: #fff;
  line-height: 25px;
  letter-spacing: 3px;
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  // .rotatep {
  //   transform: rotate(90deg);
  // }
}

</style>