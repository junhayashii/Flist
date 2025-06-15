const API_URL = 'http://localhost:8000/api';

export const fetchTags = async () => {
  const res = await fetch(`${API_URL}/tags/`);
  if (!res.ok) throw new Error("タグ取得失敗");
  return await res.json();
};

export const createTag = async (name) => {
  const res = await fetch(`${API_URL}/tags/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("タグ作成失敗");
  return await res.json();
};

export const updateTag = async (id, data) => {
  const res = await fetch(`${API_URL}/tags/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("タグ更新失敗");
  return await res.json();
};

export const deleteTag = async (id) => {
  const res = await fetch(`${API_URL}/tags/${id}/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("タグ削除失敗");
};

export const searchTags = async (query) => {
  const res = await fetch(`${API_URL}/tags/?search=${query}`);
  if (!res.ok) throw new Error("タグ検索失敗");
  return await res.json();
}; 