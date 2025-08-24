<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <div v-if="pageType === 'menu'">
        <MenuLayout/>
      </div>
      <div v-else-if="pageType === 'login'">
        <LoginLayout/>
      </div>
      <div v-else>
        <ContentLayout/>
      </div>
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
  import MenuLayout from '@/layouts/MenuLayout.vue'
  import { useRouter } from 'vue-router'
  import ContentLayout from '@/layouts/ContentLayout.vue'
  import { ref } from 'vue'
  import LoginLayout from '@/layouts/LoginLayout.vue'
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import dayjs from 'dayjs';
  import 'dayjs/locale/zh-cn';
  import UserManageLayout from '@/layouts/UserManageLayout.vue'
  dayjs.locale('zh-cn');
  //国际化
  const locale = ref(zhCN);
  //路由钩子函数，用于判断当前页面类型
  const router = useRouter();
  //页面类型：content、login、basic
  let pageType = ref<string>('');
  router.beforeEach((to) => {
    pageType.value = to.meta.pageType as string;
  })




</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}


nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
