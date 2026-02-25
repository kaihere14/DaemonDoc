import axios from "axios";

export const GITHUB_API_BASE = "https://api.github.com";

export function githubHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
  };
}

export function githubGet(url, accessToken) {
  return axios.get(url, { headers: githubHeaders(accessToken) });
}

export function githubPost(url, data, accessToken) {
  return axios.post(url, data, { headers: githubHeaders(accessToken) });
}

export function githubPut(url, data, accessToken) {
  return axios.put(url, data, { headers: githubHeaders(accessToken) });
}

export function githubDelete(url, accessToken) {
  return axios.delete(url, { headers: githubHeaders(accessToken) });
}
