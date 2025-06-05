// src/components/NoteListView.jsx
import React, { useEffect, useState } from "react";
import { fetchAllBlocks } from "../api/blocks";
import { format } from "date-fns";

export default function NoteListView({ onSelectNote }) {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const allBlocks = await fetchAllBlocks();
        const noteBlocks = allBlocks.filter((b) => b.type === "note");
        setNotes(noteBlocks);
      } catch (err) {
        console.error("ノート取得失敗:", err);
      }
    };
    loadNotes();
  }, []);

  return (
    <div className="p-6 space-y-3">
      <h2 className="text-2xl font-bold mb-4">📘 ノート一覧</h2>
      {notes.map((note) => (
        <div
          key={note.id}
          onClick={() => onSelectNote(note)}
          className="p-4 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 cursor-pointer shadow-sm"
        >
          <h3 className="font-semibold text-flist-dark">
            {note.html.match(/\[\[(.+?)\]\]/)?.[1] || "(無題ノート)"}
          </h3>
          <p className="text-sm text-gray-500">
            作成日: {format(new Date(note.created_at), "yyyy-MM-dd")}
          </p>
        </div>
      ))}
    </div>
  );
}
