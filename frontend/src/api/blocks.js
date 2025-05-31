// api/blocks.js

const BASE_URL = "http://127.0.0.1:8000/api/blocks/";

export const fetchAllBlocks = async () => {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("ブロック取得失敗");
  return await res.json();
};

export const createBlock = async (block) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(block),
  });
  if (!res.ok) throw new Error("ブロック作成失敗");
  return await res.json();
};

export const updateBlock = async (block) => {
  const res = await fetch(`${BASE_URL}${block.id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(block),
  });
  if (!res.ok) {
    const error = await res.json();
    console.error("更新失敗", error);
    throw new Error("ブロック更新失敗");
  }
};

export const deleteBlock = async (id) => {
  const res = await fetch(`${BASE_URL}${id}/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("ブロック削除失敗");
};

export const updateBlockDueDate = async (id, due_date) => {
  const res = await fetch(`http://127.0.0.1:8000/api/blocks/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ due_date }),
  });
  if (!res.ok) throw new Error("期日更新に失敗しました");
  return await res.json();
};

export const fetchTasks = async () => {
  const res = await fetch("http://127.0.0.1:8000/api/blocks/");
  if (!res.ok) throw new Error("タスク取得失敗");
  const data = await res.json();
  return data.filter((b) => b.type === "task" || b.type === "task-done");
};

export const createTask = async (text) => {
  const payload = {
    html: "- [ ] " + text,
    type: "task",
    order: Date.now(),
    list: null,
    parent_block: null,
  };

  const res = await fetch("http://127.0.0.1:8000/api/blocks/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("タスク作成失敗");
  return await res.json();
};

export const updateTask = async (task) => {
  const res = await fetch(`http://127.0.0.1:8000/api/blocks/${task.id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("タスク更新失敗");
  return await res.json();
};
