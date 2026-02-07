"use client";

import { Search, X } from "lucide-react";
import { useState, useCallback } from "react";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
  searchTypes?: { value: string; label: string }[];
  selectedType?: string;
  onTypeChange?: (type: string) => void;
}

export function SearchInput({
  placeholder = "Search...",
  value: controlledValue,
  onSearch,
  debounceMs = 300,
  searchTypes,
  selectedType,
  onTypeChange,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const value = controlledValue ?? internalValue;

  // Simple debounce
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const id = setTimeout(() => {
        onSearch(newValue);
      }, debounceMs);

      setTimeoutId(id);
    },
    [debounceMs, onSearch, timeoutId]
  );

  const handleClear = () => {
    setInternalValue("");
    onSearch("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      {searchTypes && searchTypes.length > 0 && (
        <select
          value={selectedType}
          onChange={(e) => onTypeChange?.(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {searchTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      )}

      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <button
        type="submit"
        className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Search
      </button>
    </form>
  );
}
