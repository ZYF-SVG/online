<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像框 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 表单区 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btn_bottom">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //  登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单的验证规则对象
      loginFormRules: {
        // 用户名是否合法 
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 密码是否合法
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击重置按钮，重置登录表单
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields();
    },
    // 点击登录按钮，进行表单的预验证，就是验证规则通过了，才让登录，我们先获取验证的结果
    login() {   // 输出验证的结果
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return ;  // 如果验证为 false 那就结束程序；
        // 解构赋值
        const { data: res } = await this.$http.post("login", this.loginForm);  // 获取的数据为 promise, 写 await 后就可以 data 数据
        // 使用弹框提示
        if (res.meta.status !== 200) return this.$message.error('登录失败');   // 前面的花括号就将获取到的数据 取别名；
        this.$message.success('登录成功');
        // 存储到 本地存储中；
        window.sessionStorage.setItem('token', res.data.token);
        // 进行 编程式导航 的跳转
        this.$router.push('/home');

      })
    }
  }
}
</script>

<style lang="less" scoped>
  .login_container {
    height: 100%;
    width: 100%;
    background-color: #2b4b6b;
  }
  .login_box {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 450px;
    height: 300px;
    border-radius: 3px;
    background-color: #fff;
    transform: translate(-50%, -50%);
    // 头像
    .avatar_box {
      position: absolute;
      left: 50%;
      top: -65px;
      transform: translateX(-50%);
      width: 130px;
      height: 130px;
      border-radius: 50%;
      padding: 10px;
      background-color: #fff;
      box-shadow: 0px 0px 12px #ddd;
      overflow: hidden;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
    // 表单
    .form {
      position: absolute;
      bottom: 10px;
      width: 90%;
      padding: 0 20px;
      // 按钮
      .btn_bottom {
        display: flex;
        justify-content: flex-end;
      }
    }

  }
</style>
