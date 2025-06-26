import apiClient from './axios';

export const fetchTags = async () => {
  const response = await apiClient.get('/tags/');
  return response.data;
};

export const createTag = async (name) => {
  const response = await apiClient.post('/tags/', { name });
  return response.data;
};

export const updateTag = async (id, data) => {
  const response = await apiClient.patch(`/tags/${id}/`, data);
  return response.data;
};

export const deleteTag = async (id) => {
  await apiClient.delete(`/tags/${id}/`);
};

export const searchTags = async (query) => {
  const response = await apiClient.get(`/tags/?search=${query}`);
  return response.data;
}; 