<!-- 顶部导航栏 -->
<template>
  <div id="global-header">
    <!--  栅格布局:分三列  -->
    <a-row :wrap="false">
      <!--   左侧   -->
      <a-col flex="200px">
        <router-link to="/">
          <div class="title-bar">
            <img class="logo" src="../assets/Ninja.png" alt="logo">
            <div class="title">Ninja云图库</div>
          </div>
        </router-link>
      </a-col>
      <!--   中间   -->
      <a-col flex="auto">
        <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" @click="doMenuClick"/>
      </a-col>
      <!--  右侧  -->
      <a-col flex="150px">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <ASpace @click="doUserCenter" style="cursor: pointer">
                <a-avatar :src="loginUserStore.loginUser.userAvatar" />
                <div class="user-name">{{ loginUserStore.loginUser.userName ?? '无名' }}</div>
              </ASpace>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="doUserCenter">
                    <UserOutlined />
                    个人中心
                  </a-menu-item>
                  <a-menu-item @click="doLogout">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>


  </div>
</template>
<script lang="ts" setup>
import { computed, h, ref } from 'vue'
  import { HomeOutlined,LogoutOutlined,UserOutlined } from '@ant-design/icons-vue'
  import { type MenuProps, message } from 'ant-design-vue'
  import { useRouter } from 'vue-router'
  import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
  import { userLogoutUsingGet } from '@/service/api/userController.ts'
  import checkAccess from '@/access/checkAccess.ts'
  const loginUserStore = useLoginUserStore();
  const router = useRouter();
  //current 当前选中菜单项的 key 数组
  const current = ref<string[]>([]);

  //未经过滤的菜单项
  const originItems = [
    {
      key: '/',
      icon: () => h(HomeOutlined),
      label: '主页',
      title: '主页'
    },
    {
      key: '/add_picture',
      label: '创建图片',
      title: '创建图片'
    },
    {
      key: '/admin/userManage',
      label: '用户管理',
      title: '用户管理'
    },{
      key: '/admin/pictureManage',
      label: '图片管理',
      title: '图片管理'
    },{
      key: '/user/userCenter',
      label: '个人中心',
      title: '个人中心'
    },
    {
      key: '/others',
      label: h('a',{ href: 'https://github.com/Ninja112358' ,target: '_blank' }, 'Ninja'),
      title: 'Ninja'
    }
  ];
  const menuToRouteItem = ((menu: any) => {
    // 这里需要根据自己的路由配置来转换
    return router.getRoutes().find((route) => route.path === menu.key);
  });
  // 过滤菜单项
  const items = originItems.filter((menu) => {
    const item = menuToRouteItem(menu);
    if (item?.meta?.hideInMenu) {
      return false;
    }
    // 根据权限过滤菜单，有权限则返回 true，则保留该菜单
    return checkAccess(loginUserStore.loginUser, item?.meta?.access as string);
  });

//路由跳转事件
  const doMenuClick = ({ key }: { key: string }) => {
    if(key === '/others'){
      console.log(current.value)
    }else{
      router.push({
        path: key
      });
    }

  }
  //监听路由变化的回调函数，可以用来更新当前选中菜单项的 key 数组
  router.afterEach((to, from) => {
    current.value = [to.path];
  })
  // 用户中心
  const doUserCenter = () => {
    router.push('/user/userCenter')
  }
  // 用户注销
  const doLogout = async () => {
    const res = await userLogoutUsingGet()
    console.log(res)
    if (res.data.code === 0) {
      loginUserStore.setLoginUser({
        userName: '未登录',
      })
      message.success('退出登录成功')
      await router.push('/user/login')
    } else {
      message.error('退出登录失败，' + res.data.message)
    }
  }

</script>
<style>
#global-header .user-name{
  width: 100px;
  white-space: nowrap; /* 防止文本换行 */
  overflow: hidden; /* 隐藏溢出的内容 */
  text-overflow: ellipsis; /* 显示省略号 */
}
#global-header .title-bar{
  display: flex;
  align-items: center;
}
.title-bar{
  justify-content: start;
}
.title{
  color: black;
  font-size: 16px;
  margin-left: 16px;
  font-weight: bolder;
}
.logo{
  height: 48px;
}
.user-login-status{
  display: flex;
  justify-content: center;

}
</style>
