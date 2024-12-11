import service from "./service"

// 封装 HTTP 方法
const request = {
  get(url, params = {}, config = {}) {
    return service.get(url, { params, ...config })
  },
  post(url, data = {}, config = {}) {
    return service.post(url, data, { ...config })
  },
  put(url, data = {}, config = {}) {
    return service.put(url, data, { ...config })
  },
  patch(url, data = {}, config = {}) {
    return service.patch(url, data, { ...config })
  },
  delete(url, params = {}, config = {}) {
    return service.delete(url, { params, ...config })
  },
}

export default request
