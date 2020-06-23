import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/Power/Rights.vue'
import Roles from '../components/Power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'


Vue.use(VueRouter)


const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login }, // 登录页
    {  // 主页
      path: '/home', 
      component: Home,
      redirect: '/welcome',
      children: [         // 子路由
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles' , component: Roles },
        { path: '/categories', component: Cate},
        { path: '/params', component: Params }
      ]
    }   
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
