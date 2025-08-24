import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import ACCESS_ENUM from '@/access/accessEnum.ts'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '主页',
      component: HomePage,
      meta:{
        pageType: 'menu',
      },
    },{
      path: '/picture/:id',
      name: '图片详情',
      meta:{
        pageType: 'menu',
      },
      props: true,
      component: () => import('../pages/PictureDetailPage.vue'),
    },{
      path: '/user/login',
      name: '用户登录',
      meta:{
        pageType: 'login',
      },
      component: () => import('../pages/user/UserLoginPage.vue'),
    },{
      path: '/user/register',
      name: '用户注册',
      meta:{
        pageType: 'login',
      },
      component: () => import('../pages/user/UserRegisterPage.vue'),
    },{
      path: '/add_picture',
      name: '创建图片',
      meta:{
        pageType: 'menu',
      },
      component: () => import('../pages/AddPicturePage.vue'),
    },{
      path: '/user/userCenter',
      name: '个人中心',
      meta:{
        pageType: 'menu',
      },
      component: () => import('../pages/user/UserCenterPage.vue'),
    },{
      path: '/admin/userManage',
      name: '用户管理',
      meta:{
        access: ACCESS_ENUM.ADMIN,
        pageType: 'menu'
      },
      component: () => import('../pages/admin/UserManagePage.vue'),
    },{
      path: '/admin/pictureManage',
      name: '图片管理',
      meta:{
        access: ACCESS_ENUM.ADMIN,
        pageType: 'menu'
      },
      component: () => import('../pages/admin/PictureManagePage.vue'),
    },{
      path: '/error/noAuth',
      name: '无权限访问',
      meta:{
        pageType: 'content'
      },
      component: () => import('../pages/error/NoAuthPage.vue'),
    },


  ],
})

export default router
