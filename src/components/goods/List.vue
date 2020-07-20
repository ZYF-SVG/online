<!-- 商品列表页面 -->
<template>
  <div class="list_content">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!-- 搜索框 和 添加按钮 -->
      <el-row :gutter="10">
        <el-col :span="7">
          <!-- 搜索框 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <!-- 按钮 -->
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(￥)" prop="goods_price" width="120px"></el-table-column>
        <el-table-column label="商品重量(kg)" prop="goods_weight" width="90px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="160px">
          <template v-slot:default="slopProps">
            {{slopProps.row.add_time | dateFromat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template v-slot:default="slopProps">
            <el-button type="primary" icon="el-icon-edit" plain size="mini" @click="putgoods(slopProps.row.goods_id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" plain size="mini" @click="romoveById(slopProps.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background>
      </el-pagination>

    </el-card>

    <!-- 修改对话框 -->
    <el-dialog title="提示" :visible.sync="putgoodsDialogVisible" width="50%">
      <!-- 表单 -->
      <el-form :model="getGoodsId" :rules="getGoodsRules" ref="getGoodsRuleForm" label-width="100px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="getGoodsId.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="价格" prop="goods_price">
          <el-input v-model="getGoodsId.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="数量" prop="goods_number">
          <el-input v-model="getGoodsId.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="重量" prop="goods_weight">
          <el-input v-model="getGoodsId.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="putgoodsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="putInfo">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      // 请求参数
      queryInfo: {
        query: '',  // 查询参数 和 搜索框绑定的
        pagenum: 1,  // 当前页码
        pagesize: 10 // 每页显示条数
      },
      // 总数据数
      total: 0,
      // 存储查询的商品列表数据
      goodslist: [],
      // 控制修改对话框 显示 与 隐藏
      putgoodsDialogVisible: false,
      // 存储 修改查询的数据
      getGoodsId: [],
      // 修改商品的表单验证
      getGoodsRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_number: [
           { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_weight: [
           { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],


      }
    }
  },
  created() {
    this.getGoodList();
  },
  methods:{
    // 发起获取商品列表数据请求
    async getGoodList() {
      const { data : res } = await this.$http.get('/goods', { params: this.queryInfo});

      if (res.meta.status !== 200) {
        return this.$message.error('商品列表请求失败');
      }

      // 存储数据
      this.goodslist = res.data.goods;
      this.total = res.data.total;

    },
    // 点击 每页条数 触发函数
    handleSizeChange(pageSize) {
      // 改变每页显示的数据数
      this.queryInfo.pagesize = pageSize;
      // 调用请求参数函数
      this.getGoodList();
    },
    // 点击页码触发
    handleCurrentChange(currentPage) {
      this.queryInfo.pagenum = currentPage;
      this.getGoodList();
    },
    // 点击删除按钮
    async romoveById(id) {
      const data = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err);

      // 如果没有点击 确定按钮
      if (data !== 'confirm') {
        return this.$message.info('取消成功');
      }

      // 可以到下面来就是点击确定按钮
      const { data : res } =  await this.$http.delete(`goods/${id}`);

      if (res.meta.status !==200) {
        return this.$message.error('删除商品失败');
      }

      this.$message.success('删除商品成功');
      this.getGoodList();
    },
    // 点击添加按钮
    goAddPage() {
      this.$router.push('/goods/add');
    },
    // 点击编辑按钮
    async putgoods(id) {
      // 根据 id 查询商品信息
      const { data : res } = await this.$http.get(`goods/${id}`);

      if (res.meta.status !== 200) {
        return this.$message.error('亲，获取商品参数失败');
      }

      this.getGoodsId = res.data;
      console.log(this.getGoodsId);
      // 显示修改对话框
      this.putgoodsDialogVisible = true;
    },
    // 添加修改请求
    async putInfo() {
      const { data : res } = await this.$http.put(`goods/${this.getGoodsId.goods_id}`, this.getGoodsId);
      this.putgoodsDialogVisible = false;
       this.getGoodList();
    }
  }
}
</script>

<style lang="less" scoped>

</style>