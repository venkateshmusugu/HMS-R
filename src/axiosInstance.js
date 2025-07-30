import axios from "axios";
import { isTokenExpired } from "./authUtils";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8081",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Keep this if using cookies/session
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const isAuthUrl =
      config.url.includes("/login") ||
      config.url.includes("/register") ||
      config.url.includes("/refresh-token");

    if (isAuthUrl) return config;

    let token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!token || token === "undefined") {
      console.warn("⚠️ No access token. Redirecting to login.");
      localStorage.clear();
      window.location.href = "/";
      return Promise.reject("No access token");
    }

    // ⏳ Token expired? Try to refresh
    if (isTokenExpired(token)) {
      if (!refreshToken || refreshToken === "undefined") {
        console.warn("⚠️ No refresh token. Forcing logout.");
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject("No refresh token");
      }

      try {
        const res = await axios.post("http://localhost:8081/api/users/refresh-token", {
          refreshToken,
        });

        const newToken = res.data?.token;
        if (newToken) {
          localStorage.setItem("accessToken", newToken);
          token = newToken;
        } else {
          throw new Error("Token refresh failed");
        }
      } catch (err) {
        console.error("🔴 Token refresh error:", err);
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject("Token refresh failed");
      }
    }

    // ✅ Attach valid token
    config.headers["Authorization"] = `Bearer ${token}`;

    // 🏥 Optional: Attach `hospitalId` automatically if needed
    const hospitalId = localStorage.getItem("hospitalId");
    if (hospitalId && config.method === "get") {
      const url = new URL(config.url, "http://localhost"); // dummy base
      if (!url.searchParams.has("hospitalId")) {
        const separator = config.url.includes("?") ? "&" : "?";
        config.url += `${separator}hospitalId=${hospitalId}`;
      }
    }

    return config;
  },
  (error) => {
    console.error("❌ Interceptor error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
