import Vue from 'vue';
import App from './App.vue';
import router from './router';
import './plugins/element.js';
// 引入全局 css
import './assets/css/global.css';
// 导入字体图标
import './assets/fonts/iconfont.css';
Vue.config.productionTip = false;
// 导入依赖 tree
import treeTable from 'vue-table-with-tree-grid';
// 导入富编辑器 和 他的样式文件
import VueQuillEditor from 'vue-quill-editor';
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme


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

Vue.component('tree-table', treeTable);

// 全局配置 axios
Vue.prototype.$http = axios;
// 全局配置 富文本编辑器
Vue.use(VueQuillEditor);

// 全局配置 处理时间的过滤器
Vue.filter('dateFromat', function(originVal) {
  const date = new Date(originVal);

  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const hh = date.getHours();
  const mm = date.getMinutes();
  const ss = date.getSeconds();

  return `${y}/${m}/${d} ${hh}:${mm}:${ss}`;
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
