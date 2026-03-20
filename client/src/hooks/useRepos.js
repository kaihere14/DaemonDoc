import { useState, useEffect } from "react";
import { api, ENDPOINTS } from "../lib/api";

export function useRepos(user) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRepos = async () => {
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
  };

  useEffect(() => {
    fetchRepos();
  }, [user]);

  return { repos, setRepos, loading, error, fetchRepos };
}
