import apiClient from './axios';

export const fetchLists = async () => {
  const response = await apiClient.get('/lists/');
  return response.data;
};

export const createList = async (title, folderId = null) => {
  const response = await apiClient.post('/lists/', {
    title: title || "New List",
    folder_id: folderId
  });
  return response.data;
};

export const updateListTitle = async (id, data) => {
  const response = await apiClient.patch(`/lists/${id}/`, data);
  return response.data;
};

export const deleteList = async (id) => {
  await apiClient.delete(`/lists/${id}/`);
};

export const fetchListMap = async () => {
  const response = await apiClient.get('/lists/');
  const data = response.data;

  const listMap = {};
  data.forEach((l) => {
    listMap[l.id] = l.title;
  });

  return listMap;
};
