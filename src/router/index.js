import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue');
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue');
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue');

// import Users from '../components/user/Users.vue'
// import Rights from '../components/Power/Rights.vue'
// import Roles from '../components/Power/Roles.vue'
const Users = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/user/Users.vue');
const Rights = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/Power/Rights.vue');
const Roles = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/Power/Roles.vue');

// import Cate from '../components/goods/Cate.vue'
// import Params from '../components/goods/Params.vue'
// import List from '../components/goods/List.vue'
// import Add from '../components/goods/Add.vue'
const Cate = () => import(/* webpackChunkName: "cate_params_list_add" */ '../components/goods/Cate.vue');
const Params = () => import(/* webpackChunkName: "cate_params_list_add" */ '../components/goods/Params.vue');
const List = () => import(/* webpackChunkName: "cate_params_list_add" */ '../components/goods/List.vue');
const Add = () => import(/* webpackChunkName: "cate_params_list_add" */ '../components/goods/Add.vue');

// import Order from '../components/order/Order.vue'
const Order = () => import(/* webpackChunkName: "order" */ '../components/order/Order.vue');


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
        { path: '/params', component: Params },
        { path: '/goods', component: List },
        { path: '/goods/add', component: Add },
        { path: '/orders', component: Order }
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
