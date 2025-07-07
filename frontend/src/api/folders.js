import apiClient from './axios';

export const fetchFolders = async () => {
  const response = await apiClient.get('/folders/');
  return response.data;
};

export const createFolder = async (title) => {
  const response = await apiClient.post('/folders/', { title });
  return response.data;
};

export const updateFolder = async (id, data) => {
  const response = await apiClient.patch(`/folders/${id}/`, data);
  return response.data;
};

export const deleteFolder = async (id) => {
  await apiClient.delete(`/folders/${id}/`);
};

export const moveListToFolder = async (listId, folderId) => {
  const response = await apiClient.patch(`/lists/${listId}/`, {
    folder_id: folderId
  });
  return response.data;
}; 