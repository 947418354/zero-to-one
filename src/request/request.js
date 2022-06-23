import axios from 'axios'

const instance = axios.create({})
instance.interceptors.response.use(function (res) {
    // 解密
    // res.data = decode(res.data)
    return res.data
}, (err) => {
    /* 
    服务器错误响应的错误对象 = {
        code: "ERR_BAD_REQUEST"
        config: {transitional: {…}, transformRequest: Array(1), transformResponse: Array(1), timeout: 2000, adapter: ƒ, …}
        message: "Request failed with status code 404"
        name: "AxiosError"
        request: XMLHttpRequest {onreadystatechange: null, readyState: 4, timeout: 2000, withCredentials: false, upload: XMLHttpRequestUpload, …}
        response: {data: '<!DOCTYPE html>\n<html lang="e
    }
    超时取消时的错误对象 = {
        code: "ECONNABORTED"
        config: {transitional: {…}, transformRequest: Array(1), transformResponse: Array(1), timeout: 2000, adapter: ƒ, …}
        message: "timeout of 2000ms exceeded"
        name: "AxiosError"
        request: XMLHttpReque
    }
    区分响应错误还是超时可以判断response
    message
    */
    const config = err.config;
    if (config.retry && err.message.includes('timeout')) {
        config._retryCount ? config._retryCount++ : config._retryCount = 1
        if (config._retryCount > config.maxRetry || 5) return Promise.reject(err)
        // 定时器在达到重试间隔时resolve往下执行
        const backoff = new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, config.retryDelay || 1);
        });

        // 返回一个promise，在定时器结束后重新调用instance(config)发起请求
        return backoff.then(() => instance(config))
    }
    return Promise.reject(err)
})

export default instance