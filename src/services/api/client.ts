import {Alert} from 'react-native';
import axios, {AxiosRequestConfig, Method} from 'axios';
import {isEmpty} from 'lodash';
import base64 from 'react-native-base64';
import {LQ_API, LQ_PASSWORD, LQ_USERNAME} from '@env';

/**
 * ? Local Imports
 */
import {AUTHENTICATION} from '@shared-constants';
import { clampRGBA } from 'react-native-reanimated/lib/typescript/Colors';

const baseURL = LQ_API;

const {TOKEN} = AUTHENTICATION;

const getUrl = (url: string) => {
  return `${baseURL}${url}`;
};

const getAxiosMultiPartClient = async <T>(
  method: Method,
  url: string,
  options: object | null,
  data: object | null,
  params: any = null,
) => {
  const authHeader = 'Basic ' + base64.encode(`${LQ_USERNAME}:${LQ_PASSWORD}`);

  const axiosSetup: AxiosRequestConfig = {
    withCredentials: true,
    headers: {
      Authorization: authHeader,
      'Content-Type': 'multipart/form-data',
      'Access-Control-Allow-Origin': '*',
    },
    timeout: 15000,
  };

  if (!data && method !== 'get') {
    // throw "empty data";
  }

  if (!isEmpty(params)) {
    axiosSetup.params = params;
  }

  const axiosInstance = axios.create(axiosSetup);

  axiosInstance.interceptors.response.use(
    response => {
      return response;
    },
    error => {
      console.log('--------------------------:', axiosSetup)
      console.log(axiosSetup)
      console.log('axios error:', error);
      console.log('axios error:', error.response?.data?.errors);
      // Do centralize error handling here
      // throw error;
    },
  );

  const requestUrl = getUrl(url);

  const requestConfig: AxiosRequestConfig = {
    method: method,
    params: params,
    data: data,
    url: requestUrl,
  };

  return axiosInstance.request<T>(requestConfig);
};
const getAxiosClient = async <T>(
  method: Method,
  url: string,
  options: object | null,
  data: object | null,
  params: any = null,
) => {
  // const token = await AsyncStorage.getItem(TOKEN);

  const authHeader = 'Basic ' + base64.encode(`${LQ_USERNAME}:${LQ_PASSWORD}`);

  const axiosSetup: AxiosRequestConfig = {
    withCredentials: true,
    headers: {
      Authorization: authHeader,
      'Accept-Language': 'en',
    },
    timeout: 15000,
  };

  if (!isEmpty(params)) {
    axiosSetup.params = params;
  }

  const axiosInstance = axios.create(axiosSetup);

  axiosInstance.interceptors.response.use(
    response => {
      return response;
    },
    error => {
      console.log('axios error:', error);
      Alert.alert('Axios error', error);
      // Do centralize error handling here
      throw error;
    },
  );

  const requestUrl = getUrl(url);

  const requestConfig: AxiosRequestConfig = {
    method: method,
    params: params,
    data: data,
    url: requestUrl,
  };

  return axiosInstance.request<T>(requestConfig);
};

export const authorizedRequest = <T>() => {
  return {
    get: (
      url: string,
      options: object | null = {},
      params: object | null = {},
    ) => getAxiosClient<T>('get', url, options, null, params),
    post: (url: string, data: object | null, options: object | null = {}) =>
      getAxiosClient<T>('post', url, options, data),
    put: (url: string, data: object | null, options: object | null = {}) =>
      getAxiosClient<T>('put', url, options, data),
    delete: (url: string, data: object | null, options: object | null = {}) =>
      getAxiosClient<T>('delete', url, options, data),
  };
};

export const nonAuthorizedRequest = <T>() => {
  return {
    get: (
      url: string,
      options: object | null = {},
      params: object | null = {},
    ) => getAxiosClient<T>('get', url, options, null, params),
    post: (url: string, data: object | null, options = {}) =>
      getAxiosClient<T>('post', url, options, data),
    put: (url: string, data: object | null, options: object | null = {}) =>
      getAxiosClient<T>('put', url, options, data),
    delete: (url: string, data: object | null, options: object | null = {}) =>
      getAxiosClient<T>('delete', url, options, data),
  };
};
export const nonAuthorizedMultiPartRequest = <T>() => {
  return {
    post: (url: string, data: object | null, options = {}) =>
      getAxiosMultiPartClient<T>('post', url, options, data),

    put: (url: string, data: object | null, options = {}) =>
      getAxiosMultiPartClient<T>('put', url, options, data),
  };
};

export default {
  nonAuthorizedRequest,
  authorizedRequest,
  nonAuthorizedMultiPartRequest,
};
