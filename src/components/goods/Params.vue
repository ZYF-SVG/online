<!-- 分类参数页面 -->
<template>
  <div class="paramsContent">
    <!--面包屑-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card class="box-card">
      <!-- 提示 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数!"  type="warning" show-icon :closable="false">
      </el-alert>
      
      <!-- 级联选择器, 限制级联选择器只能选择3级, 去除props的 checkStrictly  属性 -->
      <el-row>
        <el-col>显示商品分类：
          <el-cascader
            v-model="ParamsValue"
            :options="optionsList"
            :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' }"
            @change="handleChange"
            clearable
            style="margin: 20px 0;">
          </el-cascader>
        </el-col>
      </el-row>
      
      <!-- 标签页  v-model 绑定选中的 name；  @tab-click：点击标签页触发函数 -->
      <el-tabs v-model="tabName" @tab-click="tabsClick">
        <!-- 动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加动态参数按钮 -->
          <el-button type="primary" size="mini" :disabled="butBool" @click="addInfo">添加参数</el-button>
          <!-- 表格 -->
          <el-table :data="manyDate" border>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <!-- 作用域插槽 -->
              <template v-slot:default='slopProps'>
                <!-- 标签 -->
                <el-tag closable @close="deleteTab(i, slopProps.row)" v-for="(item,i) in slopProps.row.attr_vals" :key="i">
                  {{item}}
                </el-tag>
                <!-- 输入文本框, 出现了，在点击文本框时，全部列的文本框都发送改变了，还有 绑定的数据也是一样的，
                解决： 为每一个列的数据都添加自定义的属性进去，显示 和 绑定值。 -->
                <!-- {{slopProps.row}} 改变绑定的值-->
                <el-input
                  class="input-new-tag"
                  v-if="slopProps.row.inputVisible"
                  v-model="slopProps.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slopProps.row)"
                  @blur="handleInputConfirm(slopProps.row)"
                  style="width: 120px"
                >
                </el-input>
                <!-- 输入标签 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(slopProps.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <!-- 参数列 -->
            <el-table-column label="参数" prop="attr_name"></el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作">
              <template v-slot:default="slopProps">
                <!-- {{ slopProps.row }} -->
                <!-- 操作按钮 -->
                <el-button type="primary" icon="el-icon-edit" plain size="mini" @click="modifyInfo(slopProps.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" plain  size="mini" @click="deleteInfo(slopProps.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 静态属性 -->
        <el-tab-pane label="静态属性" name="only">
           <!--添加静态属性按钮 -->
          <el-button type="primary" size="mini" :disabled="butBool" @click="addInfo">添加参数</el-button>
          <!-- 表格 -->
          <el-table :data="onlyDate" border>
            <!-- 展开列 -->
             <el-table-column type="expand">
              <!-- 作用域插槽 -->
              <template v-slot:default='slopProps'>
                <!-- 标签 -->
                <el-tag closable @close="deleteTab(i, slopProps.row)" v-for="(item,i) in slopProps.row.attr_vals" :key="i">
                  {{item}}
                </el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="slopProps.row.inputVisible"
                  v-model="slopProps.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slopProps.row)"
                  @blur="handleInputConfirm(slopProps.row)"
                  style="width: 120px"
                >
                </el-input>
                <!-- 输入标签 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(slopProps.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <!-- 参数列 -->
            <el-table-column label="参数" prop="attr_name"></el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作">
              <template v-slot:default="slopProps">
                <!-- {{ slopProps.row }} -->
                <!-- 操作按钮 -->
                <el-button type="primary" icon="el-icon-edit" plain size="mini" @click="modifyInfo(slopProps.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" plain  size="mini" @click="deleteInfo(slopProps.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数 和 属性的对话框 -->
    <el-dialog
      :title=" '添加' + addText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addClearForm">
      <!-- 输入框 -->
      <el-form :model="addForm" :rules="addRules" ref="addRef" label-width="100px">
        <el-form-item :label="addText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRequest">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog
      :title=" '修改' + addText"
      :visible.sync="modifyDialogVisible"
      width="50%"
      @close="modifyClearForm">
      <!-- 输入框 -->
      <el-form :model="modifyForm" :rules="modifyRules" ref="modifyRef" label-width="100px">
        <el-form-item :label="addText" prop="attr_name">
          <el-input v-model="modifyForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyInfoIng">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      // 存储商品分类的列表
      optionsList: [],
      // 级联选择器 的选择结果
      ParamsValue: [],
      // 存储标签页选中的name, 默认为1
      tabName: 'many',
      // 存储动态参数
      manyDate: [],
      // 存储静态属性
      onlyDate: [],
      // 添加对话框显示与否
      addDialogVisible: false,
      // 添加表单绑定数据
      addForm: {
        attr_name: ''
      },
      // 表单的验证规则
      addRules: {
        attr_name: [
            { required: true, message: '请输入添加的数据', trigger: 'blur' },
        ]
      },
      // 修改对话框出现与否
      modifyDialogVisible: false,
      // 定义修改 参数 的验证规则
      modifyRules: {
        attr_name: [
            { required: true, message: '请输入修改的数据', trigger: 'blur' },
        ]
      },
      // 存储根据 id 查询的参数
      modifyForm: {},
      // 当前选中第三级商品的id
      cartId: '',
    }
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品分类列表
    async getCateList() {
      const { data : res } = await this.$http.get('categories');
   
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!');
      }

      this.optionsList = res.data;
    },
    // 级联选择器 选择后触发
    handleChange() {
      // 如果级联选择器选择的结果为 空的，那就清空2个数据
      if (this.ParamsValue.length == 0) {
        this.manyDate = [];
        this.onlyDate = [];
      }

      // 发起分类参数请求；
      this.getParamsList();
    },
    // 点击 标签页时触发
    tabsClick() {
      console.log(this.tabName);
      // 发起分类参数请求；
      this.getParamsList();
    },
    // 获取分类参数列表
    async getParamsList() {
      // 三级的id
      const id = this.ParamsValue[2];

      // 获取点击的是动 或是 静态属性
      const state = this.tabName;
      const { data : res } = await this.$http.get(`categories/${ id }/attributes`, {
        params: { sel: state }
      })

      // if (res.meta.status !== 200) {
      //   return this.$message.error('获取商品参数列表失败');
      // }

      // 把商品中的 参数，拿出来，进行截取成数据，再放进去
      // 就是将 字符串 转化为 数组 。
      res.data.forEach(item => {
        // 解决 attr_vals 为空，渲染空标签问题
        item.attr_vals = item.attr_vals == '' ? [] : item.attr_vals.split(',') ;
        // 给每个数据添加 显示的属性
        item.inputVisible = false;
        // 给每个数据添加 绑定的内容
        item.inputValue = '';
      })

      // 判断是 动态参数 还是 静态属性，分别存储到不同的数组中作为不同表格的渲染源
      if (state == 'many') {
        this.manyDate = res.data;
      } else {
        this.onlyDate = res.data;
      }
    },
    // 点击添加按钮触发
    addInfo() {
      this.addDialogVisible = true;
    },
    // 添加对话框消失触发 重置表单
    addClearForm() {
      this.$refs.addRef.resetFields();
    },
    // 点击确定按钮，发送添加参数请求
    addRequest() {
      this.$refs.addRef.validate(async value => {
        if (!value) return 
        const id = this.ParamsValue[2];

        const { data : res } = await this.$http.post(`categories/${id}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.tabName
        })

        if (res.meta.status !== 201) {
          return this.$message.error('发起添加参数失败');
        }

        this.getParamsList();
        this.addDialogVisible = false;
      })  
    },
    // 点击出现 修改对话框
    async modifyInfo(id) {
      // 商品的 id
      this.cartId = id;

      // 发起获取 参数信息
      const { data : res } = await this.$http.get(`categories/${this.cartIda}/attributes/${this.cartId}`, {
        params: { attr_sel: this.tabName }
      });

      if (res.meta.status !== 200) {
        return this.$message.error('查询失败');
      }

      this.modifyForm = res.data;
      this.modifyDialogVisible = true;
    },
    // 重置修改对话框
    modifyClearForm() {
      this.$refs.modifyRef.resetFields();
    },
    // 提交 修改 数据
    modifyInfoIng() {
      this.$refs.modifyRef.validate( async valid => {
        if (!valid) return ;

        const { data : res } = await this.$http.put(`categories/${this.cartIda}/attributes/${this.modifyForm.attr_id}`, {
          attr_name: this.modifyForm.attr_name,
          attr_sel: this.tabName
        })

        if (res.meta.status !== 200) {
          return this.$message.error('编辑参数失败');
        }

        this.$message.success('编辑参数成功');
        this.modifyDialogVisible = false;

        this.getParamsList();
      })
      
    },
    // 点击删除 商品参数
    async deleteInfo(id) {
      const { data : res } = await this.$http.delete(`categories/${this.cartIda}/attributes/${id}`)
    
      if (res.meta.status !== 200){
        return this.$message.error('删除商品参数失败');
      }

      this.$message.success('删除商品参数成功');
      this.getParamsList();
    },
    // 点击叉号，删除商品参数标签
    async deleteTab(i, row) {
      // 删除 slopProps.row.inputValue 中的数据， 根据 索引 先删除页面中的 参数
      row.attr_vals.splice(i,1);

      // 发起修改请求
      this.setParameter(row);

    },
    // 按下 enter 回车键 和 失去 焦点，文本触发的事件
    handleInputConfirm(row) {
      // 在转换为按钮前，先进行判断，看看文本框内容是否为空，或是有空格出现。
      if (row.inputValue.trim().length == 0) {
        row.inputValue = '';
        row.inputVisible = false;
        return;
      }
      // 当不为空时，要去除输入字符的2边的空格, 这里不能直接赋值，因为后面在输入新的值时，会覆盖前面的
      // 注意，是添加到渲染表格的源数组，保存在属性中是没有用的。
      row.attr_vals.push(row.inputValue.trim());
      // 清空 文本框 中绑定数据, 不然会输入 1 个值，会添加2个标签；
      row.inputValue = '';
      // 隐藏按钮
      row.inputVisible = false;

      this.setParameter(row);
    },
    // 点击 添加标签 触发事件
    showInput(row) {
      // 显示文本框
      row.inputVisible = true;
      // 自动获取焦点, 关于这个函数，就是在页面元素渲染后，才执行的，放在
      // 页面元素，还没有渲染好，获取不到元素。
      this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 修改 和 删除 参数，都调用这个方法！ 编辑提交参数
    async setParameter(row) {
      // 发起添加参数请求
      const { data : res } = await this.$http.put(`categories/${this.cartIda}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals:  row.attr_vals.join(',')
      })

       if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败!');
      }

      this.$message.success('修改参数成功!');
    }
  },
  // 计算属性
  computed: {
    // 监听级联选中器的长度
    butBool() {
      // 如果级联选择器 没有选中第三级
      if (this.ParamsValue.length !== 3) {
        return  true;
      }
      return  false;
    },
    // 监听添加对话框，看选中的是 静态 还是 动态
    addText() {
      if (this.tabName == 'many') {
        return '动态参数';
      } else {
        return '静态属性';
      }
    },
    // 箭头选中第三级参数的id
    cartIda() {
      return this.ParamsValue[2];
    }
  }
}
</script>

<style lang="less" scoped>
  .paramsContent {
    // 商品参数标签
    .el-tag {
      margin: 0 10px;
    }
  }
</style>