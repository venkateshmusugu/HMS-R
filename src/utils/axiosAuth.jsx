// axiosAuth.js
import axios from "axios";

const token = localStorage.getItem("token");

export const axiosAuth = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    Authorization: token ? `Bearer ${token}` : "",
  },
});
