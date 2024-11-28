import axios from "axios"

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL || "http://localhost:3030", // 替换为你的 API 基础 URL
  timeout: import.meta.env.VITE_APP_TIMEOUT || 10000, // 请求超时时间
  headers: {
    "Content-Type": "application/json",
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 可以在此处添加授权令牌或其他配置
    // config.headers.Authorization = `Bearer ${token}`;
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (res) => res,
  (error) => {
    const { response } = error
    // 处理错误
    if (response) {
      // 例如重定向到登录页面
      switch (response.status) {
        case 401:
          // throw new Error("认证失败，请重新登录")
          console.log("认证失败，请重新登录")
          // localStorage.removeItem("token") // 移除 token
          // window.location.href = "/login"
          break
        case 403:
          console.log("没有权限访问")
          break
        case 404:
          console.log("请求地址不存在")
          break
        default:
          console.log(response.data?.message || "服务器错误")
      }
    } else {
      console.log("网络连接异常")
    }
    return Promise.reject(error)
  }
)

export default service
