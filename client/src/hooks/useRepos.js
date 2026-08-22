import { useState, useEffect, useCallback } from "react";
import { api, ENDPOINTS } from "../lib/api";

export function useRepos(user) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRepos = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(ENDPOINTS.REPOS);
      setRepos(data.reposData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  return { repos, setRepos, loading, error, fetchRepos };
}
