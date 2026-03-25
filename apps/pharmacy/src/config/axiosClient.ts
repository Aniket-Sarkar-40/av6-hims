import axios from "axios";
import { EXT_CONNECTION_TYPE } from "@repo/shared/config/index.js";

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
