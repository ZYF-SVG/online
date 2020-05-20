import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)


const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login }, // 登录页
    { path: '/home', component: Home }   // 主页
  ]
})

// 在暴露路由前 进行处理, 给路由添加 路由导航守卫
router.beforeEach((to, from, next) => {
  // 判断 用户是否 访问登录页面，如果是，就 放行
  if (to.path === '/login') return next();
  // 过滤后，就剩下，不是访问登录页面的； 从 本地存储中获取 token
  const tokenStr = window.sessionStorage.getItem('token');
  // 如果没有 token， 强制跳转到登录页面
  if (!tokenStr) return next('/login');
  next();
}) 

export default router
