import { useState, useEffect, useCallback } from "react";
import { login as apiLogin, signup as apiSignup, logout as apiLogout, getProfile } from "../api/auth";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (token) {
      getProfile(token)
        .then(setUser)
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    setToken(data.token);
    localStorage.setItem("token", data.token);
    setUser(await getProfile(data.token));
    return data;
  }, []);

  const signup = useCallback(async (email, password, password_confirm) => {
    const data = await apiSignup(email, password, password_confirm);
    setToken(data.token);
    localStorage.setItem("token", data.token);
    setUser(await getProfile(data.token));
    return data;
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      await apiLogout(token);
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
    }
  }, [token]);

  return { user, token, loading, login, signup, logout };
} 