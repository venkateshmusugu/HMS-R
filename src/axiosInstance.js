import axios from "axios";
import { isTokenExpired } from "./authUtils";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8081",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});


axiosInstance.interceptors.request.use(async (config) => {
  // ✅ Skip token for login or refresh
  const isAuthUrl = config.url.includes('/login') || config.url.includes('/refresh-token');
  if (isAuthUrl) {
    return config;
  }

  let token = localStorage.getItem("accessToken");

  if (!token || token === "undefined") {
    console.warn("⚠️ No valid token found. Skipping Authorization header.");
    return config;
  }

  // ✅ Handle expired token
  if (isTokenExpired(token)) {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const response = await axios.post("http://localhost:8081/api/users/refresh-token", {
        refreshToken,
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