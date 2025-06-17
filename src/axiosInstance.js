import axios from "axios";
import { isTokenExpired } from "./authUtils";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8081",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});


// Request Interceptor
axiosInstance.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("accessToken");

  // Prevent "Bearer undefined"
  if (token === "undefined" || !token) {
    console.warn("⚠️ No valid token found. Skipping Authorization header.");
    return config;
  }

  if (isTokenExpired(token)) {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      const response = await axios.post("http://localhost:8081/api/users/refresh-token", {
        refreshToken: refreshToken,
      });

      const newToken = response.data.token;
      localStorage.setItem("accessToken", newToken);
      token = newToken;
    } catch (error) {
      console.error("🔴 Refresh token failed. Logging out.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/";
      return config;
    }
  }

  config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

export default axiosInstance;