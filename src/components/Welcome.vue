<template>
  <div class="welcome_content">
    <!-- 图片 -->
    <div class="img_text">
      <img src="../assets/logo.png" alt="">
      <h3>欢迎登录后台管理页面</h3>
    </div>
  </div>
</template>

<script>
export default {
  
}
</script>

<style lang="less" scoped>
  .welcome_content {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .img_text {
    position: absolute;
    top: 15%;
    left: 50%;
    width:  300px;
    height: 300px;
    text-align: center;
    font-size: 20px;
    transform: translateX(-50%);
    img {
      width: 100%;
    }
    h3 {
      letter-spacing: 5px;
      font-weight: 400;
    }
  }
</style>