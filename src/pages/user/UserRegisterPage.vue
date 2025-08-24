<template>
  <div id="userRegisterPage">
    <h1 class="title">Ninja云图库 - 用户注册</h1>
    <div class="desc">菜鸡的智能协同云图库</div>
    <a-form
      :model="formState"
      name="basic"
      autocomplete="off"
      @finish="handleSubmit"
    >
      <a-form-item
        name="userAccount"
        :rules="[{ required: true, message: '账号不能为空' }]"
      >
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号"/>
      </a-form-item>

      <a-form-item
        name="userPassword"
        :rules="[
          { required: true, message: '密码不能为空' },
          { min: 8, message: '密码长度不能少于 8 位' }
        ]"
      >
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码"/>
      </a-form-item>
      <a-form-item
        name="checkPassword"
        :rules="[
          { required: true, message: '确认密码不能为空' },
          { min: 8, message: '密码长度不能少于 8 位' }
        ]"
      >
        <a-input-password v-model:value="formState.checkPassword" placeholder="请再次输入密码"/>
      </a-form-item>
      <div class="tips">
        已有账号?
        <router-link to="/user/register">去登录</router-link>
      </div>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%;">注册</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from 'vue';
import { userLoginUsingPost, userRegisterUsingPost } from '@/service/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import router from '@/router'

// 用于接收表单输入的值
const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: ''
});
const loginUserStore = useLoginUserStore();

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  // 校验两次密码输入是否一致
  if(values.userPassword !== values.checkPassword){
    message.error("两次密码输入不一致");
    return;
  }
  const res = await userRegisterUsingPost(values);
  //注册成功，跳转到登录页
  if(res.data.code === 0 && res.data.data){
    await loginUserStore.fetchLoginUser();
    message.success('注册成功');
    await router.push({
      path: '/user/login',
      replace: true
    });
  }else{
    message.error("注册失败," + res.data.message);
  }
};
</script>

<style scoped>
#userRegisterPage {
  max-width: 360px;
  margin: 0 auto;
}
.title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 16px;
}
.desc{
  text-align: center;
  color: #bbb;
  font-size: 14px;
  margin-bottom: 16px;
}
.tips{
  color: #bbb;
  text-align: right;
  font-size: 13px;
  margin-bottom: 16px;
}
</style>
