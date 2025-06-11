// src/components/NoteListView.jsx
import React, { useEffect, useState } from "react";
import { fetchAllBlocks } from "../api/blocks";
import { format } from "date-fns";
import { fetchListMap } from "../api/lists";

export default function NoteListView({ onSelectNote, selectedNote }) {
  const [notes, setNotes] = useState([]);
  const [lists, setLists] = useState({});

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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allBlocks, listMap] = await Promise.all([
          fetchAllBlocks(),
          fetchListMap(),
        ]);
        const noteBlocks = allBlocks.filter((b) => b.type === "note");
        setNotes(noteBlocks);
        setLists(listMap);
      } catch (err) {
        console.error("ノート取得失敗:", err);
      }
    };
    loadData();
  }, [selectedNote]);

  return (
    <div className="p-6 space-y-3">
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
          <p className="text-sm text-gray-500">
            リスト: {note.list ? lists[note.list] : "Inbox"}
          </p>
        </div>
      ))}
    </div>
  );
}
