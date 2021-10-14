import axios from 'axios';

export const userRequest = axios.create({});

userRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = {
      error: {
        message: `${error.response.status} ${error.response.statusText}`,
      },
    };
    return errorMessage;
  },
);

export const apiUser = (data) => userRequest.get('api/users', { params: data });
export const userCreate = (data) => userRequest.post('api/user', data);
export const userModify = (data) => userRequest.put(`/api/user/${data.id}`, data);
export const userDelete = (id) => userRequest.delete(`/api/user/${id}`);
