import * as Cookies from 'js-cookie';

const TOKEN_KEY = 'token';

// 获取地址栏url中的参数
export const getQueryString = name => {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i');
  const regRewrite = new RegExp(`(^|/)${name}/([^/]*)(/|$)`, 'i');
  const r = window.location.search.substr(1).match(reg);
  const q = window.location.pathname.substr(1).match(regRewrite);
  if (r != null) {
    return unescape(r[2]);
  }
  if (q != null) {
    return unescape(q[2]);
  }
  return null;
};

export const setToken = token => {
  Cookies.set(TOKEN_KEY, token);
};

export const getToken = () => {
  const token = Cookies.get(TOKEN_KEY);
  if (token) {
    return token;
  }
  return false;
};
