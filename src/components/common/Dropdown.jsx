import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

export default function Dropdown({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  error,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full" ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-gray-500 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`
            w-full flex items-center justify-between bg-white border rounded-lg
            px-3 py-2.5 text-sm text-left transition-colors
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40
            ${error ? 'border-red-400' : 'border-gray-200'}
            ${value ? 'text-gray-900' : 'text-gray-400'}
          `}
        >
          <span className="truncate">{value || placeholder}</span>
          <FiChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="absolute z-20 mt-1.5 w-full max-h-56 overflow-y-auto bg-white border border-gray-100 rounded-lg shadow-lg animate-[fadeIn_0.15s_ease-out]">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-gray-900 hover:bg-gray-50 transition-colors text-left"
              >
                {opt}
                {value === opt && (
                  <FiCheck size={14} className="text-blue-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
