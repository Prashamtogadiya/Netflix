import React, { useState } from "react";

export default function TagInput({ label, values, setValues, placeholder }) {
  const [input, setInput] = useState("");
  const handleAdd = (e) => {
    e.preventDefault();
    const val = input.trim();
    if (val && !values.includes(val)) {
      setValues([...values, val]);
    }
    setInput("");
    return false;
  };
  const handleRemove = (val) => {
    setValues(values.filter((v) => v !== val));
  };
  return (
    <div className="mb-2 md:col-span-2">
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((val) => (
          <span
            key={val}
            className="bg-red-600 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs"
          >
            {val}
            <button
              type="button"
              className="ml-1 text-white hover:text-gray-200"
              onClick={() => handleRemove(val)}
              aria-label="Remove"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholder}
          className="p-2 rounded bg-gray-800 text-white flex-1"
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd(e);
            }
          }}
        />
        <button
          type="button"
          className="bg-gray-700 hover:bg-red-600 text-white px-3 py-1 rounded font-semibold"
          onClick={handleAdd}
        >
          Add
        </button>
      </div>
    </div>
  );
}
