import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onTagsChange: (newTags: string[]) => void;
  placeholder: string;
  label: string;
  helpText?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  onTagsChange,
  placeholder,
  label,
  helpText
}) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes(',')) {
      const newTag = value.replace(',', '').trim();
      setInput('');
      if (newTag) {
        addTagIfValid(newTag);
      }
    } else {
      setInput(value);
    }
  };

  const addTag = () => {
    if (input.trim()) {
      addTagIfValid(input.trim());
      setInput('');
    }
  };

  const addTagIfValid = (tag: string) => {
    if (!tags.includes(tag)) {
      onTagsChange([...tags, tag]);
    }
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    onTagsChange(newTags);
  };

  return (
    <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    {label}
  </label>
  {helpText && (
    <p className="text-sm text-gray-500 mb-2">{helpText}</p>
  )}
  <div className="min-h-[42px] p-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
    {/* Tags container (now above input) */}
    {tags.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 inline-flex items-center p-0.5 hover:bg-indigo-200 rounded-full"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
    )}

    {/* Input below tags */}
    <div>
      <input
        type="text"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="w-full outline-none border-none p-0.5 bg-transparent"
      />
    </div>
  </div>
</div>
  );
};

export default TagInput;