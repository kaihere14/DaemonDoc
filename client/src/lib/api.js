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
  PAYMENT_PLANS: "/api/payments/plans",
  PAYMENT_MY_PLAN: "/api/payments/my-plan",
  PAYMENT_CREATE_ORDER: "/api/payments/create-order",
  PAYMENT_VERIFY: "/api/payments/verify",
  ADMIN_PAYMENT_USERS: "/api/payments/admin/users",
  ADMIN_REVOKE_PLAN: "/api/payments/admin/revoke-plan",
  ADMIN_UPDATE_PLAN_PRICE: "/api/payments/admin/update-plan-price",
  ADMIN_PAYMENT_ANALYTICS: "/api/payments/admin/analytics",
};
