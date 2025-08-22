import axios from 'axios';
import { LQ_API, LQ_PASSWORD, LQ_USERNAME } from '@env';
const useApiConfig = () => {
  const instance = axios.create({
    baseURL: LQ_API,
    auth: {
      username: LQ_USERNAME,
      password: LQ_PASSWORD,
    },
  });

  const state = {
    http: instance,
  };

  const header: any = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };
  const header2 = {
    'Content-Type': 'multipart/form-data',
    'Access-Control-Allow-Origin': '*',
  };

  return {
    state,
    header,
    header2,
  };
};

export default useApiConfig;
