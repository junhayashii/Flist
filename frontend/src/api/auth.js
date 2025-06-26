import axios from "axios";

const API_BASE = "/api/accounts";

export async function login(email, password) {
  const res = await axios.post(`${API_BASE}/login/`, { email, password });
  return res.data;
}

export async function signup(email, password, password_confirm) {
  const res = await axios.post(`${API_BASE}/register/`, { email, password, password_confirm });
  return res.data;
}

export async function logout(token) {
  return axios.post(`${API_BASE}/logout/`, {}, {
    headers: { Authorization: `Token ${token}` }
  });
}

export async function getProfile(token) {
  const res = await axios.get(`${API_BASE}/profile/`, {
    headers: { Authorization: `Token ${token}` }
  });
  return res.data;
} 