import axios from 'axios'
import { message } from 'ant-design-vue'

const myAxios = axios.create({
  baseURL: 'http://localhost:8123/',
  timeout: 60000,
  withCredentials: true,
});

// 添加请求拦截器
axios.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  const { data } = response;
  if(data.code === 40100){
    // 未登录
    // 如果是和需要登录有关的请求，就跳转到登录页
    if( !response.request.responseURL.includes('user/get/login') &&
        !window.location.href.includes('/user/login')){
      message.warning("请先登录");
      window.location.href = `/user/login?redirect=${window.location.href}`;
    }
  }
  if(data.code === 50000){
    //服务器内部错误
    message.error("服务器内部错误:" + data.message);
  }
  return response;
}, function (error) {
  // 对响应错误做点什么
  return Promise.reject(error);
});

export default myAxios;
