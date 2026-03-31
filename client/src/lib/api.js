import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const api = axios.create({
  baseURL: BACKEND_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const ENDPOINTS = {
  AUTH_VERIFY: "/auth/verify",
  AUTH_DELETE: "/auth/delete",
  REPOS: "/api/github/getGithubRepos",
  ADD_REPO: "/api/github/addRepoActivity",
  DEACTIVATE_REPO: "/api/github/deactivateRepoActivity",
  FETCH_LOGS: "/api/github/fetchUserLogs",
  ADMIN_ANALYTICS: "/api/github/admin/analytics",
  DISMISS_REPOS_NOTIFICATION: "/auth/dismiss-repos-notification",
};
