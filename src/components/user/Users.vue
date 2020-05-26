<template>
  <div>
    <!-- 面包屑導航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用戶管理</el-breadcrumb-item>
      <el-breadcrumb-item>用戶列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="box-card">
      <!-- 搜索框 和 按鈕 -->
      <el-row :gutter="15">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable  @clear="this.getUserList">
            <el-button slot="append" icon="el-icon-search" @click="this.getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="addDialogVisible = true">添加用戶</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="this.userlist" :stripe="true" :border="true">
        <!-- 列 -->
        <el-table-column type="index"></el-table-column> <!--索引列-->
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="郵箱" prop="email"></el-table-column>
        <el-table-column label="電話" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <!-- 状态 -->
        <el-table-column label="狀態">
          <!-- 使用作用域插槽获取鼠标的 状态 -->
          <template v-slot:default="slotProps">
            <el-switch v-model="slotProps.row.mg_state" @change="userStateChanged(slotProps.row)" ></el-switch>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column label="操作">
          <template v-slot:default="slotProps">
            <!-- {{ slotProps.row }} -->
            <!-- 修改 -->
            <el-button type="primary" @click="modify(slotProps.row.id)" icon="el-icon-edit" plain size="mini"></el-button>
            <!-- 刪除 -->
            <el-button type="danger" @click="removeUser(slotProps.row.id, slotProps.row.username)" icon="el-icon-delete" plain size="mini"></el-button>
            <!-- 添加角色 -->
            <el-tooltip effect="dark" content="分配角色" placement="top-end" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" plain size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table> 
       <!-- 分页 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 3, 4]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
    </el-card>

    <!-- 添加用户框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="resetForm">
      <!-- 内容 -->
      <el-form :model="addForm" :rules="userRules" ref="ruleFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" show-password></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="determine">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户信息框 -->
    <el-dialog title="修改用户信息" :visible.sync="modifyDialogVisible" width="50%" @close="modifClear">
      <!-- 表单 -->
      <el-form :model="modifyForm" :rules="userRules" ref="modifyFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="modifyForm.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="modifyForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="modifyForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 删除用户弹框 -->

<!-- 213 -->
  </div>
</template>

<script>
export default {
  data() {
    // 自定义表单验证规则
    var validateEmail = (rule, value, cb) => {
      // 验证邮箱的 正直表达式
      var checkEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/ ; 
      // 进行判断
      if (checkEmail.test(value)) {
        // 验证正确，返回
        return cb(); 
      }
      cb(new Error('请输入合法的邮箱号'));
    }
    // 自定义手机验证规则
    var validatePhone = (rule, value, cb) => {
      var regckMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regckMobile.test(value)) {
        return cb();
      }
      cb(new Error('请输入合法的手机号'));
    }
    return {
      // 把請求的參數，定義為參數, 好 之后進行修改（根據 API 文檔數據
      queryInfo: {
        query: '',    // 查询的关键字
        pagenum: 1,   // 當前頁碼
        pagesize: 4   // 每頁顯示條數
      },
      // 保存用戶數據
      userlist: [],
      // 總條數
      total: 0,
      // 添加用户框 是否显示
      addDialogVisible: false,
      // 修改用户信息框 是否显示
      modifyDialogVisible: false,
      //  存储添加用户的 数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 存储添加用户表单的 验证规则对象
      userRules: {
        username: [ 
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
         email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
         mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: validatePhone, trigger: 'blur' }
        ]
      },
      // 存储修改数据的对象
      modifyForm: {}
    }
  },
  created() {
    // data 和 methods 初始化 調用；
    this.getUserList();
  },
  methods: {
    // 發起用戶列表數據請求
    async getUserList() {
       const { data : res } = await this.$http.get('users', {
        params: this.queryInfo 
      })
      // 進行判斷
      if (res.meta.status !== 200) {
        return this.$message.error('獲取用戶列表失敗');
      }
        this.userlist = res.data.users;
        this.total = res.data.total;
    },
    // 点击 每页条数 触发函数
    handleSizeChange(pageSize) {
      // 点击 每页条数 时，传递过来参数，然后赋予 发起请求的 pagesize 参数
      // 再一次发起请求
      this.queryInfo.pagesize = pageSize;
      this.getUserList();
    } ,
    //  点击 当前页 触发函数
    handleCurrentChange(currentPage) {
      // 改变当前页
       this.queryInfo.pagenum = currentPage;
       this.getUserList();
    },
    // 更改用户状态发送变化时，触发函数
    async userStateChanged(userinfo) {
      // userinfo 为当前用户的数据，修改同时，发起 更改用户数据的请求
      const { data : res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`);
      if (res.meta.status !== 200) {
        // 失败时，把用户的状态取反，因为是 双向数据绑定的
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error('修改用户状态失败');
      }
      this.$message.success("修改用户状态成功");
    },
    // 当添加用户表单关闭时，触发
    resetForm() {
      // 拿到 表单对象，然后调用 重置函数
      this.$refs.ruleFormRef.resetFields();
    },
    // 对表单进行 预校验, 并发起添加用户请求
    determine() {
      this.$refs.ruleFormRef.validate(async value => {
        // 不通过时
        if (!value) {
          return this.$message.error('表格内容不正确');
        }
        // 通过 发起添加用户请求
        const { data : res } = await this.$http.post('users', this.addForm);
        if (res.meta.status !== 201) return this.$message.error('添加用户失败');
        // 添加成功
        this.$message.success('添加用户成功');
        // 关闭对话框
        this.addDialogVisible = false;
        // 从新查询 使用用户
        this.getUserList();
      })
    },
    // 修改用户数据
    async modify(id) {
      this.modifyDialogVisible = true;
      // 发起查询用户请求
      const { data : res } = await this.$http.get('users/'+ id);
      if (res.meta.status !== 200) {
        return this.$message.error('根据 id 查询用户失败');
      }
      // 赋值
      this.modifyForm = res.data;
    },
    // 当修改用户对话框关闭时，触发 重置
    modifClear() {
      this.$refs.modifyFormRef.resetFields();
    },
    // 对修改用户 进行验证规则，然后发送修改用户请求
    modifyUserInfo() {
      this.$refs.modifyFormRef.validate(async value => {
        if (!value) {
          return this.$message.error('请验证输入的内容');
        }

        // 发起修改请求
        const { data : res } = await this.$http.put('users/' + this.modifyForm.id, {
          email:  this.modifyForm.email,
          mobile:  this.modifyForm.mobile
        });

        if(res.meta.status !== 200) {
          return this.$message.error('修改用户信息失败');
        }

        // 关闭对话框
        this.modifyDialogVisible = false;
        // 重新请求用户列表数据
        this.getUserList();
        // 提示成功
        this.$message.success('修改用户信息成功');

      })
    },
    // 删除用户
    async removeUser(id, username) {
      // 用 async 和 await 来获取返回值
      const data = await this.$confirm('此操作将永久删除该 '+ username +' 用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).catch(err => {
        return err;  // 点击取消输出 cancel
      })
      
      // 判断用户点击了，那个按钮
      if (data !== 'confirm') {
        return this.$message.info('取消成功!');
      }

      // 发起删除请求
      const { data : res } = await this.$http.delete('users/' + id);
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败');
      }
      
      // 重新获取用户列表
      this.getUserList();
      this.$message.success('删除用户 '+ username +' 成功');
       //console.log(data);  点击确定输出 confirm
    }
  } 
};
</script>

<style lang="less" scoped>
.el-dialog {
  .el-form {
    width: 80%;
    margin: 0 auto;
  }
}
</style>