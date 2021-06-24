import axios from 'axios';

export const userRequest = axios.create({
  baseURL: 'http://localhost:9988/',
});

export const apiUser = (data) => userRequest.get('api/users', { params: data });
export const apiChangePage = (data) => userRequest.get('api/users', { params: data });
export const apiSearchPage = (data) => userRequest.get('api/users', { params: data });
