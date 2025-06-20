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
    body: JSON.stringify({
      ...block,
      tag_ids: block.tag_ids || []
    }),
  });
  if (!res.ok) throw new Error("ブロック作成失敗");
  return await res.json();
};

export const updateBlock = async (block) => {
  const res = await fetch(`${BASE_URL}${block.id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...block,
      tag_ids: block.tag_ids || []
    }),
  });
  if (!res.ok) {
    const error = await res.json();
    console.error("更新失敗", error);
    throw new Error("ブロック更新失敗");
  }
  return await res.json();
};

export const deleteBlock = async (id) => {
  const res = await fetch(`${BASE_URL}${id}/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("ブロック削除失敗");
};

export async function updateBlockDueDate(id, due_date) {
  const res = await fetch(`http://localhost:8000/api/blocks/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ due_date }),
  });
  if (!res.ok) throw new Error("Failed to update due date");
}

export const fetchTasks = async () => {
  const res = await fetch("http://127.0.0.1:8000/api/blocks/");
  if (!res.ok) throw new Error("タスク取得失敗");
  const data = await res.json();
  return data.filter((b) => b.type === "task" || b.type === "task-done");
};

export const createTask = async (text, tagIds = []) => {
  const payload = {
    html: "- [ ] " + text,
    type: "task",
    order: Date.now(),
    list: null,
    parent_block: null,
    tag_ids: tagIds
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

export const createNote = async (title = "New Note", tagIds = []) => {
  const payload = {
    html: `[[${title}]]`,
    type: "note",
    order: Date.now(),
    list: null,
    parent_block: null,
    tag_ids: tagIds
  };

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("ノート作成失敗");
  return await res.json();
};

export const fetchBlock = async (id) => {
  const res = await fetch(`${BASE_URL}${id}/`);
  if (!res.ok) throw new Error("ブロック取得失敗");
  return await res.json();
};
