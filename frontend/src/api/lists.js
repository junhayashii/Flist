import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const fetchLists = async () => {
  const response = await axios.get(`${API_URL}/lists/`);
  return response.data;
};

export const createList = async (title, folderId = null) => {
  const response = await axios.post(`${API_URL}/lists/`, {
    title: title || "New List",
    folder_id: folderId
  });
  return response.data;
};

export const updateListTitle = async (id, data) => {
  const response = await axios.patch(`${API_URL}/lists/${id}/`, data);
  return response.data;
};

export const deleteList = async (id) => {
  await axios.delete(`${API_URL}/lists/${id}/`);
};

export const fetchListMap = async () => {
  const res = await fetch("http://127.0.0.1:8000/api/lists/");
  if (!res.ok) throw new Error("リスト取得失敗");
  const data = await res.json();

  const listMap = {};
  data.forEach((l) => {
    listMap[l.id] = l.title;
  });

  return listMap;
};
