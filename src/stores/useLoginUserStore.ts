import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUserUsingGet } from '@/service/api/userController.ts'

/*
 * 存储登录用户信息的状态
 */
export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser = ref<API.LoginUserVO>({
  })

  async function fetchLoginUser() {
    try {
      const res = await getLoginUserUsingGet();
      if(res.data.code === 0 && res.data.data)
        loginUser.value = res.data.data
    } catch (error) {
      console.log('获取登录用户信息失败', error)
    }
  }
  /**
   * 设置登录用户信息
   * @param newLoginUser
   */
  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser
  }
  return { loginUser, fetchLoginUser, setLoginUser }
})
