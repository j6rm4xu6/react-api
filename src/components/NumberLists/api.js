import axios from 'axios';

export const userRequest = axios.create({
  baseURL: 'http://localhost:9988/',
});

export const apiUser = (data) => userRequest.get('api/users', { params: data });
export const userCreate = (data) => userRequest.post('api/users', data);
export const userModify = (id, data) => userRequest.put(`/api/Users/${id}`, data, { params: id });
export const userDelete = (id) => userRequest.delete(`/api/Users/${id}`, { params: id });
