import { FiCalendar } from 'react-icons/fi';

export default function DatePicker({
  label,
  value,
  onChange,
  error,
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-500 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <FiCalendar
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="date"
          value={value}
          onChange={onChange}
          className={`
            w-full bg-white border rounded-lg text-gray-900
            pl-9 pr-3 py-2.5 text-sm outline-none transition-colors
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40
            [color-scheme:light]
            ${error ? 'border-red-400' : 'border-gray-200'}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
