/* eslint-disable class-methods-use-this */
import Axios from 'axios';
import { Message } from 'element-ui';
import * as Cookies from 'js-cookie';


class HttpRequest {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  getInsideConfig() {
    const config = {
      baseURL: this.baseUrl,
    };
    return config;
  }

  interceptors(instance) {
    // 响应拦截
    instance.interceptors.response.use((response) => {
      // if (response && response.data && (response.data.retCode !== '0000')) {
      // console.log(response);
      if (response && response.data && (response.data.rspCode !== '000000000' && response.data.code !== '200' && response.data.stateCode !== '3000')) {
        Message({
          showClose: true,
          message: response.data.retMsg,
          type: 'error',
        });
        return Promise.reject(new Error(response.data.retMsg));
      }
      return response.data;
    }, (error) => {
      let { message } = error;
      if (error && error.response) {
        switch (error.response.status) {
          // 未登录
          case 401:
            // TODO 服务端返回的登录地址如何处理
            // eslint-disable-next-line no-case-declarations
            let jumpUrl = window.location.pathname;
            // 部分url带jsessionid
            jumpUrl = jumpUrl.replace(/;jsessionid=\w*/, '');
            Cookies.set('jump_url', jumpUrl);
            // Cookies.remove('userInfo', { domain: window.DOMAIN });
            // 清除后端是pyhton 子系统cookie
            // Cookies.remove('ticket');
            // 清除图计算cookie
            // localStorage.removeItem('jwt');
            // window.location.href = window.BASE_UAS_LOGIN_URL + window.location.href;
            window.location.href = error.response.headers.location;
            break;
          case 403:
            // TODO 403什么情况？
            // window.location.href = error.response.data.login_url;
            window.location.href = `${window.location.origin}/board/403`;
            break;
          default:
            Message({
              showClose: true,
              message: '真抱歉！服务器繁忙，请您稍后再试。',
              type: 'error',
            });
        }
      } else {
        if (/timeout/.test(message) || /request fail/.test(message) || /request:fail/.test(message)) { message = '真抱歉！服务器繁忙，请您稍后再试。'; }
        Message({
          showClose: true,
          message,
          type: 'error',
        });
      }
      return Promise.reject(error);
    });
  }

  request(options) {
    const instance = Axios.create();
    options = Object.assign(this.getInsideConfig(), options);

    instance.defaults.headers.common.Accept = 'application/json';
    instance.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest';
    instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    instance.defaults.timeout = 20000;
    this.interceptors(instance);
    return instance(options);
  }

  getInstance() {
    const instance = Axios.create(this.getInsideConfig);
    instance.defaults.headers.common.Accept = 'application/json';
    instance.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest';
    instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    instance.defaults.timeout = 20000;
    this.interceptors(instance);
    return instance;
  }
}
const baseURL = '/';
const http = new HttpRequest(baseURL).getInstance();
export default http;
