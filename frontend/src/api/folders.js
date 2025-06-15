import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const fetchFolders = async () => {
  const response = await axios.get(`${API_URL}/folders/`);
  return response.data;
};

export const createFolder = async (title) => {
  const response = await axios.post(`${API_URL}/folders/`, { title });
  return response.data;
};

export const updateFolder = async (id, data) => {
  const response = await axios.patch(`${API_URL}/folders/${id}/`, data);
  return response.data;
};

export const deleteFolder = async (id) => {
  await axios.delete(`${API_URL}/folders/${id}/`);
};

export const moveListToFolder = async (listId, folderId) => {
  const response = await axios.patch(`${API_URL}/lists/${listId}/`, {
    folder_id: folderId
  });
  return response.data;
}; 