const BASE_URL = "http://127.0.0.1:8000/api/lists/";

export const fetchLists = async () => {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("リスト取得失敗");
  return await res.json();
};

export const createList = async (title) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("リスト作成失敗");
  return await res.json();
};

export const deleteList = async (id) => {
  const res = await fetch(`${BASE_URL}${id}/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("リスト削除失敗");
  return true;
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
