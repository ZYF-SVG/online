<!-- 订单页面 -->
<template>
  <div class="order_constent">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!-- 搜索框行 -->
      <el-row>
        <el-col :span="6">
          <el-input placeholder="请输入内容"  v-model="orders.query" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格行 -->
      <el-row>
        <el-table :data="orderList" style="width: 100%" border stripe>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column prop="order_number" label="订单编号"></el-table-column>
          <el-table-column prop="order_price" label="订单价格" width="100px"></el-table-column>
          <el-table-column prop="pay_status" label="订单付款" width="150px">
            <template v-slot:default="slopProps">
              <el-tag v-if="slopProps.row.pay_status == '0'" type="danger">未付款</el-tag>
              <el-tag v-else type="success">已付款</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="is_send" label="是否发货" width="100px"></el-table-column>
          <el-table-column prop="create_time" label="下单时间">
            <template v-slot:default="slopProps">
              {{slopProps.row.create_time | dateFromat}} 
            </template>
          </el-table-column>
          <el-table-column prop="order_number" label="操作">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" plain></el-button>
            <el-button type="success" icon="el-icon-s-tools" size="mini" plain @click="kuaidiInfo"></el-button>
          </el-table-column>
         </el-table>
      </el-row>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="orders.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="orders.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 快递进度 对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="kuaidiDialogVisible"
      width="50%">
     <!-- 时间线 -->
     <el-timeline :reverse="false">
        <el-timeline-item
          v-for="(activity, index) in courierList"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 订单列表的请求参数
      orders: {
        query: '',    // 查询参数
        pagenum: 1,   // 当前页
        pagesize: 10, // 每页显示条数
      },
      total: 0, // 总数据
      // 存储订单列表数据
      orderList: [],
      // 快递对话框显示与隐藏
      kuaidiDialogVisible: false,
      // 存储快递信息
      courierList: []
    }
  },
  created() {
    // 页面初始化就调用 请求订单列表函数
    this.getOrderList();
  },
  methods: {
    // 获取订单列表
    async getOrderList() {
      const { data : res } = await this.$http.get('orders', {
        params: this.orders
      });

      if (res.meta.status !== 200) {
        return this.$message.error('查询订单列表失败');
      }

      this.orderList = res.data.goods;
      // 总数据
      this.total = res.data.total;
      console.log(this.orderList);
    },
    // 选择页面显示多少页，触发函数
    handleSizeChange(size) {
      this.orders.pagesize = size;
      this.getOrderList();
    },
    // 点击 页码 触发函数
    handleCurrentChange(pagenum) {
      this.orders.pagenum = pagenum;
      this.getOrderList();
    },
    // 点击 物流按钮
    async kuaidiInfo() {
      // 发起快递信息请求
      const { data : res } = await this.$http.get(`/kuaidi/1106975712662`);

      if (res.meta.status !== 200) {
        return this.$message.error('请求快递信息失败');
      }

      this.courierList = res.data;
      this.kuaidiDialogVisible = true;
    }
  }
}
</script>

<style lang="lass" scoped>
  
</style>