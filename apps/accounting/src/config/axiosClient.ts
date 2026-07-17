import { EXT_CONNECTION_TYPE } from "@repo/shared/config/index.js";
import { generateHashForAuth } from "@repo/shared/utils/helper.utils.js";
import axios from "axios";

export const axiosClient = axios.create({
  headers: {
    "Connection-Type": EXT_CONNECTION_TYPE,
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const interceptor = (token: string) => {
  return axios.create({
    headers: {
      "Connection-Type": EXT_CONNECTION_TYPE,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-internal-request": "true",
    },
    withCredentials: true,
  });
};

export const externalInterceptor = () => {
  const randomNumber: number = Math.floor(Math.random() * 1000000);
  const hash: string = generateHashForAuth(randomNumber.toString());

  return axios.create({
    headers: {
      "Content-Type": "application/json",
      "client-key": hash,
      "client-id": randomNumber.toString(),
    },
    validateStatus: () => true,
  });
};
