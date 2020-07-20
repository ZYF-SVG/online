<!-- 商品分类页面 -->
<template>
  <div class="cateContent">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card class="box-card">
      <!-- 按钮 -->
      <el-button type="primary" @click="addCateInfo">添加分类</el-button>
      <!-- 表格 -->
      <tree-table  :data="allGoods" :columns="columns" :show-index="true" index-text="#" border
      :show-row-hover="false" :selection-type="false" :expand-type="false">
        <!-- 是否有效列，使用作用域插槽单独 tree 插件的 template, 如果不和 isok 一起使用，作用域
        插槽中的内容，就渲染不出来。 -->
        <template v-slot:isok="slopProps">
          <i class="el-icon-success" v-if="slopProps.row.cat_deleted === false" style="color: #BCEFB0"></i>
          <i class="el-icon-error" v-else></i>
        </template>
        <!-- 等级列 -->
        <template v-slot:grade="slopProps">
          <el-tag v-if="slopProps.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="slopProps.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作列 -->
        <template v-slot:operation="slopProps">
           <el-button type="primary" size="small" plain icon="el-icon-edit" @click="modifyCate(slopProps.row.cat_id)">编辑</el-button>
           <el-button type="danger" size="small" plain icon="el-icon-delete" @click="deleteCate(slopProps.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination  @size-change="pageSize"  @current-change="currentPage"  
      :current-page="allParameter.pagenum"  :page-sizes="[3, 5, 10, 15, 20]"  :page-size="allParameter.pagesize"  layout="total, sizes, prev, pager, next, jumper"  :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addResetForm">
      <!-- 表单 -->
      <el-form :model="addCateRuleForm" :rules="addCateRules" ref="addCateRuleFormRef" label-width="100px">
        <el-form-item label="分类名称:"  prop="cat_name">
          <el-input v-model="addCateRuleForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- 联选择器  v-model: 绑定选中的id值；  options：数据源-->
          <el-cascader v-model="cescaderKey" :options="cateDate" :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children', checkStrictly: true}" 
          @change="selectCateInfo" style="width: 100%;" clearable>
          </el-cascader>
          </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateRequest">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog
      title="编辑商品"
      :visible.sync="modifyDialogVisible"
      width="50%">
      <!-- 表单 -->
      <el-form ref="modifyFormRef" :model="selectCateId" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="selectCateId.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyCateImg">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 250 -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品列表的请求参数
      allParameter: {
        // 当前页面 和 每页显示多少数据
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 存储所有商品列表
      allGoods: [],
      // 商品列表的总数据
      total: 0,
      // tree 设置每列
      columns: [{ 
          label: '分类名称',
          prop: 'cat_name'
        }, 
        {
          label: '是否有效',
          // 搭配使用
          type: 'template',  // 自定义列模板
          template: 'isok'   // 对应的作用域插槽
        },
        {
          label: '等级',
          type: 'template',
          template: 'grade'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operation'
        }
      ],
      // 添加分类对话框 显示隐藏控制
      addCateDialogVisible: false,
      // 添加分类的验证规则
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 存储添加分类的数据
      addCateRuleForm: {
        // 分类父级的 id，默认为 0，一级
        cat_pid: 0,
        // 分类名称
        cat_name: '',
        // 分类成次，默认为 0，一级
        cat_level: 0
      },
      // 存储 1，2级商品的数据
      cateDate: [],
      // 存储联选择器 选取的值
      cescaderKey: [],
      // 编辑 分类对话框 隐藏与否
      modifyDialogVisible: false,
      // 存储 根据id查询的分类的数据
      selectCateId: {}
    };
  },
  created() {
    // 页面初始化，就获取商品列表
    this.getGoodsList();
  },
  methods: {
    // 获取商品分类列表
    async getGoodsList() {
      const { data : res } = await this.$http.get('categories', { params: this.allParameter });
      if (res.meta.status !== 200) {
        return this.$message.error('请求商品列表失败');
      }

      this.allGoods = res.data.result;
      // 总数据
      this.total =  res.data.total;
      // console.log(this.total);
    },
    // 点击 每页条数 触发
    pageSize(data) {
      this.allParameter.pagesize = data;
      this.getGoodsList();
    },
    // 点击 当前页 触发
    currentPage(data) {
      this.allParameter.pagenum = data;
      this.getGoodsList();
    },
    // 点击添加分类按钮
    addCateInfo() {
      this.addCateDialogVisible = true;
      // 调用函数，查取 1，2级数据
      this.selectCate();
    },
    // 获取1，2级的商品数据
    async selectCate() {
      const { data : res } = await this.$http.get('categories', { params: { type: 2 } })
     
      if ( res.meta.status !== 200 ) {
        return this.$message.error('请求1，2级商品数据失败');
      }

      this.cateDate = res.data;
      console.log(this.cateDate);
   },
    // 联选择器，选取数据时，调用的函数  
    selectCateInfo() {
      console.log(this.cescaderKey);

      if (this.cescaderKey.length !== 0) {  // 数组的长度，如果等于 0，就证明 分类父级的 id，不为零
        // 分类父级的 id
        this.addCateRuleForm.cat_pid = this.cescaderKey[this.cescaderKey.length - 1];  
        // 分类成次
        this.addCateRuleForm.cat_level = this.cescaderKey.length;
      } else {
        this.addCateRuleForm.cat_pid = 0;
        this.addCateRuleForm.cat_level = 0;
      }
    },
    // 重置添加商品表单 和 绑定的数据
    addResetForm() {
      // 清空表单
      this.$refs.addCateRuleFormRef.resetFields();
      // 清空绑定数据
      this.cescaderKey = [];
      // 清空请求参数
      this.addCateRuleForm.cat_pid = 0;
      this.addCateRuleForm.cat_level = 0;
    },
    // 点击确定按钮，发起 添加商品 请求；
    addCateRequest() {
      // 通过预验证 
      this.$refs.addCateRuleFormRef.validate(async value => {
        if (!value) {
          return this.$message.error('请输入分类名称');
        }
        
        const { data : res } = await this.$http.post('categories', this.addCateRuleForm);
        
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败!');
        }

        this.$message.success('添加分类成功')
        this.addCateDialogVisible = false;
        this.getGoodsList();

      })
    },
    // 删除分类
    async deleteCate(id) {
      const { data : res } = await this.$http.delete('categories/' + id)
      if ( res.meta.status !== 200) {
        return this.$message.error('删除分类失败');
      }

      this.$message.success('删除分类成功');
      this.getGoodsList();
    },
    // 点击编辑按钮触发
    async modifyCate(id) {
      // 根据查询分类的名称
      const { data : res } = await this.$http.get('categories/' + id);
      if (res.meta.status !== 200) {
        return this.$message.error('修改失败');
      }

      this.selectCateId = res.data;
      this.modifyDialogVisible = true;
    },
    // 点击确定按钮，发起修改请求
    async modifyCateImg() {
      const { data : res } = await this.$http.put('categories/' + this.selectCateId.cat_id, {
        cat_name: this.selectCateId.cat_name
      })

      if (res.meta.status !== 200) {
        return this.$message.error('修改失败');
      }

      this.$message.success('修改成功');
      this.modifyDialogVisible = false;
      this.getGoodsList();
    }
  }
};
</script>

<style lang="less" scoped>
.cateContent {  
  // 表格
  .zk-table {
     margin-top: 20px;
  }
  // 分页
  .el-pagination {
    margin-top: 15px;
  }
}
</style>