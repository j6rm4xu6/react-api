import axios from 'axios';

export const userRequest = axios.create({});

const errorInfo = {
  open: false,
  header: '',
  message: '',
};

userRequest.interceptors.request.use(
  (config) => config,
  (error) => { Promise.reject(error); },
);

userRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    errorInfo.open = true;
    if (error.response) {
      errorInfo.header = `Error:${error.response.status}`;
      errorInfo.message = 'API抓取異常';
    } else if (error.request) {
      errorInfo.header = `Error:${error.request}`;
      errorInfo.message = 'API發送請求失敗';
    } else {
      errorInfo.header = '其他';
      errorInfo.message = `Error:${error.message}`;
    }
    if (!window.navigator.onLine) {
      errorInfo.header = '網路出了點問題';
      errorInfo.message = '請重新連線後重整網頁';
    }
    return Promise.reject(errorInfo);
  },
);

export const apiUser = (data) => userRequest.get('api/users', { params: data });
export const userCreate = (data) => userRequest.post('api/user', data);
export const userModify = (id, data) => userRequest.put(`/api/user/${id}`, data);
export const userDelete = (id) => userRequest.delete(`/api/user/${id}`);
