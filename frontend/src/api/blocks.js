// api/blocks.js
import apiClient from './axios';

const BASE_URL = "http://127.0.0.1:8000/api/blocks/";

export const fetchAllBlocks = async () => {
  const response = await apiClient.get('/blocks/');
  return response.data;
};

export const createBlock = async (block) => {
  const response = await apiClient.post('/blocks/', {
    ...block,
    tag_ids: block.tag_ids || [],
  });
  return response.data;
};

export const updateBlock = async (block) => {
  const response = await apiClient.patch(`/blocks/${block.id}/`, {
    ...block,
    tag_ids: block.tag_ids || [],
  });
  return response.data;
};

export const deleteBlock = async (id) => {
  await apiClient.delete(`/blocks/${id}/`);
};

export async function updateBlockDueDate(id, due_date) {
  const response = await apiClient.patch(`/blocks/${id}/`, { due_date });
  return response.data;
}

export const fetchTasks = async () => {
  const response = await apiClient.get('/blocks/');
  const data = response.data;
  return data.filter((b) => b.type === "task" || b.type === "task-done");
};

export const createTask = async (text) => {
  const response = await apiClient.post('/blocks/', {
    html: text,
    type: 'task',
    list: null,
    parent_block: null,
  });
  return response.data;
};

export const updateTask = async (task) => {
  const response = await apiClient.patch(`/blocks/${task.id}/`, task);
  return response.data;
};

export const createNote = async (title = "New Note") => {
  const response = await apiClient.post('/blocks/', {
    html: title,
    type: 'note',
    list: null,
    parent_block: null,
  });
  return response.data;
};

export const fetchBlock = async (id) => {
  const response = await apiClient.get(`/blocks/${id}/`);
  return response.data;
};

export const fetchTags = async () => {
  const response = await apiClient.get('/tags/');
  return response.data;
};

export const createTag = async (name) => {
  const response = await apiClient.post('/tags/', { name });
  return response.data;
};

export const updateTag = async (id, name) => {
  const response = await apiClient.patch(`/tags/${id}/`, { name });
  return response.data;
};

export const deleteTag = async (id) => {
  await apiClient.delete(`/tags/${id}/`);
};
