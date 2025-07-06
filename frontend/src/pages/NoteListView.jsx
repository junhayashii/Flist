// src/components/NoteListView.jsx
import React, { useEffect, useState } from "react";
import { fetchAllBlocks, createNote } from "../api/blocks";
import { format } from "date-fns";
import { fetchListMap } from "../api/lists";
import {
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  List,
  X,
  Tag,
  Plus,
} from "lucide-react";

export default function NoteListView({ onSelectNote, selectedNote }) {
  const [notes, setNotes] = useState([]);
  const [lists, setLists] = useState({});
  const [selectedLists, setSelectedLists] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

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

    // Add event listener for note updates
    const handleNoteUpdate = (event) => {
      const updatedNote = event.detail;
      setNotes(prev => prev.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      ));
    };

    // Add event listener for note deletion
    const handleNoteDeleted = (event) => {
      const deletedNote = event.detail;
      setNotes(prev => prev.filter(note => note.id !== deletedNote.id));
    };

    window.addEventListener('noteUpdated', handleNoteUpdate);
    window.addEventListener('noteDeleted', handleNoteDeleted);
    return () => {
      window.removeEventListener('noteUpdated', handleNoteUpdate);
      window.removeEventListener('noteDeleted', handleNoteDeleted);
    };
  }, [selectedNote]);

  const getFilteredAndSortedNotes = () => {
    let filtered = [...notes];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(note => {
        const title = note.html.match(/\[\[(.+?)\]\]/)?.[1] || "(無題ノート)";
        return title.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Apply list filter
    if (selectedLists.length > 0) {
      filtered = filtered.filter(note => selectedLists.includes(String(note.list)));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "created_at":
          comparison = new Date(a.created_at) - new Date(b.created_at);
          break;
        case "title": {
          const aTitle = a.html.match(/\[\[(.+?)\]\]/)?.[1] || "";
          const bTitle = b.html.match(/\[\[(.+?)\]\]/)?.[1] || "";
          comparison = aTitle.localeCompare(bTitle);
          break;
        }
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  };

  const clearFilters = () => {
    setSelectedLists([]);
    setSearchQuery("");
  };

  const handleCreateNote = async () => {
    try {
      const newNote = await createNote("New Note");
      
      // Open the detail panel for the new note
      onSelectNote?.(newNote);
      
      // Dispatch event for real-time note count updates
      window.dispatchEvent(new CustomEvent('noteCreated', { detail: newNote }));
    } catch (err) {
      console.error("ノート作成失敗:", err);
    }
  };

  const filteredNotes = getFilteredAndSortedNotes();

  return (
    <div className="p-8 mx-8 space-y-8">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[var(--color-flist-dark)]">Notes</h1>
        <button
          onClick={handleCreateNote}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-flist-accent)] text-white rounded-lg hover:bg-[var(--color-flist-accent-hover)] transition-colors"
        >
          <Plus size={16} />
          New Note
        </button>
      </div>

      {/* Filter/Sort + Search */}
      <div className="bg-[var(--color-flist-surface)] border border-[var(--color-flist-border)] rounded-xl shadow-sm px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 text-sm border border-[var(--color-flist-border)] rounded-lg px-3 py-1.5 bg-[var(--color-flist-surface)] hover:bg-[var(--color-flist-surface-hover)] hover:border-[var(--color-flist-accent)] transition-all duration-200"
              >
                <Filter size={16} className="text-[var(--color-flist-muted)]" />
                <span className="text-[var(--color-flist-dark)]">Filter</span>
                {(selectedLists.length > 0 || searchQuery) && (
                  <span className="bg-[var(--color-flist-blue-light)] text-[var(--color-flist-accent)] px-2 py-0.5 rounded-full text-xs font-medium">
                    Active
                  </span>
                )}
              </button>
              {filterOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-[var(--color-flist-surface)] border border-[var(--color-flist-border)] rounded-lg shadow-lg z-10">
                  <div className="p-3 border-b border-[var(--color-flist-border)]">
                    <h3 className="font-medium text-[var(--color-flist-dark)]">Filter by List</h3>
                  </div>
                  <div className="p-3 max-h-48 overflow-y-auto">
                    {Object.entries(lists).map(([id, name]) => (
                      <label key={id} className="flex items-center gap-2 p-2 hover:bg-[var(--color-flist-surface-hover)] rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedLists.includes(id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLists([...selectedLists, id]);
                            } else {
                              setSelectedLists(selectedLists.filter(l => l !== id));
                            }
                          }}
                          className="rounded border-[var(--color-flist-border)] text-[var(--color-flist-accent)] focus:ring-[var(--color-flist-accent)]"
                        />
                        <span className="text-sm text-[var(--color-flist-dark)]">{name}</span>
                      </label>
                    ))}
                  </div>
                  {(selectedLists.length > 0 || searchQuery) && (
                    <div className="p-3 border-t border-[var(--color-flist-border)]">
                      <button
                        onClick={clearFilters}
                        className="w-full text-sm text-[var(--color-flist-accent)] hover:text-[var(--color-flist-accent-dark)]"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sort Button */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 text-sm border border-[var(--color-flist-border)] rounded-lg px-3 py-1.5 bg-[var(--color-flist-surface)] hover:bg-[var(--color-flist-surface-hover)] hover:border-[var(--color-flist-accent)] transition-all duration-200"
              >
                {sortOrder === "asc" ? (
                  <SortAsc size={16} className="text-[var(--color-flist-muted)]" />
                ) : (
                  <SortDesc size={16} className="text-[var(--color-flist-muted)]" />
                )}
                <span className="text-[var(--color-flist-dark)]">Sort</span>
              </button>
              {sortOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--color-flist-surface)] border border-[var(--color-flist-border)] rounded-lg shadow-lg z-10">
                  <div className="p-3 border-b border-[var(--color-flist-border)]">
                    <h3 className="font-medium text-[var(--color-flist-dark)]">Sort by</h3>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSortBy("created_at");
                        setSortOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        sortBy === "created_at"
                          ? "bg-[var(--color-flist-blue-light)] text-[var(--color-flist-accent)]"
                          : "text-[var(--color-flist-dark)] hover:bg-[var(--color-flist-surface-hover)]"
                      }`}
                    >
                      Created Date
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("title");
                        setSortOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        sortBy === "title"
                          ? "bg-[var(--color-flist-blue-light)] text-[var(--color-flist-accent)]"
                          : "text-[var(--color-flist-dark)] hover:bg-[var(--color-flist-surface-hover)]"
                      }`}
                    >
                      Title
                    </button>
                  </div>
                  <div className="p-2 border-t border-[var(--color-flist-border)]">
                    <button
                      onClick={() => {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        setSortOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--color-flist-dark)] hover:bg-[var(--color-flist-surface-hover)]"
                    >
                      {sortOrder === "asc" ? "Ascending" : "Descending"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ノートを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--color-flist-surface)] border border-[var(--color-flist-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-flist-primary)] focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-flist-muted)] hover:text-[var(--color-flist-dark)]"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note)}
              className={`
                p-4 rounded-lg border 
                ${selectedNote?.id === note.id 
                  ? 'border-[var(--color-flist-accent)] bg-[var(--color-flist-blue-light)]' 
                  : 'border-[var(--color-flist-border)] bg-[var(--color-flist-surface)]'}
                hover:bg-[var(--color-flist-surface-hover)]
                cursor-pointer transition-all duration-200 ease-in-out
              `}
            >
              <h3 className="text-base font-medium text-[var(--color-flist-dark)] mb-2">
                {note.html.match(/\[\[(.+?)\]\]/)?.[1] || "(無題ノート)"}
              </h3>
              {/* Second line: List, Date, Tags */}
              <div className="flex items-center gap-3 mt-2 text-sm text-[var(--color-flist-muted)]">
                {note.list && (lists[note.list]?.title || (typeof lists[note.list] === 'string' && lists[note.list])) && (
                  <span className="flex items-center gap-1">
                    <List className="w-3 h-3" />
                    {lists[note.list]?.title || (typeof lists[note.list] === 'string' ? lists[note.list] : undefined)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(note.created_at), "yyyy-MM-dd")}
                </span>
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.map(tag => (
                    <span
                      key={tag.id}
                      title={tag.name.length > 16 ? tag.name : undefined}
                      className={
                        `tag tag-primary flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-flist-surface)] border border-[var(--color-flist-border)] text-xs font-medium`
                      }
                    >
                      <Tag className="w-3 h-3 text-[var(--color-flist-accent)]" />
                      {tag.name.length > 16 ? tag.name.slice(0, 14) + '…' : tag.name}
                    </span>
                  ))}
                </div>
              )}
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}
