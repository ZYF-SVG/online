<template>
<!-- 权限列表 -->
  <div class="rights-content">
    <!-- 面板屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card class="box-card">
      <!-- 表格 -->
      <template>
        <el-table :data="rightsList" border :stripe="true">
          <el-table-column type="index"></el-table-column> <!--索引列-->
          <el-table-column  prop="authName" label="權限名稱"></el-table-column>
          <el-table-column  prop="path" label="路徑"> </el-table-column>
          <el-table-column label="權限等級">
            <!-- 作用域插槽 -->
            <template v-slot:default="slotProps">
              <el-tag v-if="slotProps.row.level == '0'">一級</el-tag>
              <el-tag v-else-if="slotProps.row.level == '1'" type="success">二級</el-tag>
              <el-tag v-else type="warning">三級</el-tag>
            </template>
         </el-table-column>
        </el-table>
      </template>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 存储请求的权限数据
      rightsList: []
    }
  },

  created() {
    this.getRightList();
  },
  methods: {
    //  data 和 methods 初始化就调用的声明周期函数；
    async getRightList() {
      const { data : res } = await this.$http.get('rights/list');
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败');
      }
      this.rightsList = res.data;
    }
  }
}
</script>

<style lang="less" scoped>
  .rights-content {
    .el-table {
      border-radius: 5px;
      width: 98%; 
      margin: 20px auto;
    }
  }

</style>