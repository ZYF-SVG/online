import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 引入全局 css
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css';
Vue.config.productionTip = false

// 使用 axios 进行 http 请求
import axios from 'axios';

// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';
// 在挂载 axiox 之前，创建一个 请求拦截器，处理发送的 请求头
axios.interceptors.request.use( config => {
  // 给请求头添加一个 Authorization 字段，值为 token 令牌
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
})

Vue.prototype.$http = axios;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
