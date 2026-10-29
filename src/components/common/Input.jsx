/**
 * Input.jsx
 * Used for: expense amount, description, loan person name, etc.
 * Handles label, error message, optional left icon, and file/text/number types.
 */
export default function Input({
  label,
  error,
  icon: Icon,
  className = '',
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
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        )}
        <input
          className={`
            w-full bg-white border rounded-lg text-gray-900 placeholder:text-gray-400
            px-3 py-2.5 text-sm outline-none transition-colors
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40
            ${Icon ? 'pl-9' : ''}
            ${error ? 'border-red-400' : 'border-gray-200'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
