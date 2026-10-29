export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="inline-flex bg-gray-50 border border-gray-100 rounded-lg p-1 gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md
            transition-all duration-200
            ${
              active === tab.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }
          `}
        >
          {tab.icon && <tab.icon size={16} />}
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                active === tab.value ? 'bg-white/20' : 'bg-gray-200'
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
