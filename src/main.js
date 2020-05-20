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
Vue.prototype.$http = axios;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
