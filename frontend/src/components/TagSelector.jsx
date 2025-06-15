import React, { useState, useEffect } from 'react';
import { fetchTags, searchTags, createTag } from '../api/tags';
import { Tag, X, Plus } from 'lucide-react';

const TagSelector = ({ selectedTags = [], onChange }) => {
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [localSelectedTags, setLocalSelectedTags] = useState(selectedTags);

  useEffect(() => {
    setLocalSelectedTags(selectedTags);
  }, [selectedTags]);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const data = await fetchTags();
      setTags(data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsLoading(true);
      try {
        const results = await searchTags(query);
        setTags(results);
      } catch (error) {
        console.error('Failed to search tags:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      loadTags();
    }
  };

  const handleCreateTag = async (name) => {
    try {
      const newTag = await createTag(name);
      setTags(prev => [...prev, newTag]);
      const newSelectedTags = [...localSelectedTags, newTag.id];
      setLocalSelectedTags(newSelectedTags);
      onChange(newSelectedTags);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const handleTagSelect = (tagId) => {
    const newSelectedTags = localSelectedTags.includes(tagId)
      ? localSelectedTags.filter(id => id !== tagId)
      : [...localSelectedTags, tagId];
    setLocalSelectedTags(newSelectedTags);
    onChange(newSelectedTags);
  };

  const handleRemoveTag = (tagId, e) => {
    e.stopPropagation();
    const newSelectedTags = localSelectedTags.filter(id => id !== tagId);
    setLocalSelectedTags(newSelectedTags);
    onChange(newSelectedTags);
  };

  const getSelectedTagNames = () => {
    return localSelectedTags
      .map(id => tags.find(tag => tag.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const getTagById = (id) => tags.find(tag => tag.id === id);

  return (
    <div className="relative">
      <div
        className="flex flex-wrap items-center gap-2 p-2 border rounded cursor-pointer min-h-[2.5rem]"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {localSelectedTags.length > 0 ? (
          localSelectedTags.map(tagId => {
            const tag = getTagById(tagId);
            if (!tag) return null;
            return (
              <div
                key={tagId}
                className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Tag className="w-3 h-3" />
                <span>{tag.name}</span>
                <button
                  onClick={(e) => handleRemoveTag(tagId, e)}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })
        ) : (
          <span className="text-sm text-gray-500">Add tags...</span>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          <div className="p-2 border-b">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search or create tag..."
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="p-2 text-center text-gray-500">Loading...</div>
            ) : (
              <>
                {tags.map(tag => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleTagSelect(tag.id)}
                  >
                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                      localSelectedTags.includes(tag.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                    }`}>
                      {localSelectedTags.includes(tag.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="flex-1">{tag.name}</span>
                  </div>
                ))}
                {searchQuery && !tags.some(tag => tag.name === searchQuery) && (
                  <div
                    className="flex items-center gap-2 p-2 text-blue-600 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleCreateTag(searchQuery)}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create "{searchQuery}"</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagSelector; 