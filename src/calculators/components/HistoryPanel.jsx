import { FiClock, FiTrash2, FiArrowUpRight } from 'react-icons/fi';
import EmptyState from '../../components/common/EmptyState';

export default function HistoryPanel({ history, onSelect, onClear }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
        <div>
          <h2 className="text-gray-900 font-semibold text-sm">
            Calculation History
          </h2>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClear}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Clear history"
          >
            <FiTrash2 size={14} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <EmptyState
            icon={FiClock}
            message="No calculations yet"
            subMessage="Your saved calculations will appear here."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.result)}
                className="group w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-900 text-sm font-medium truncate">
                      {item.title}
                    </p>

                    <p className="text-gray-400 text-[11px] mt-0.5 truncate">
                      {item.description}
                    </p>
                  </div>

                  <FiArrowUpRight
                    size={14}
                    className="text-gray-400 group-hover:text-blue-600 transition-colors shrink-0 mt-0.5"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 mt-2">
                  <p className="text-gray-500 text-xs truncate">
                    {item.expression}
                  </p>

                  <p className="text-blue-600 text-sm font-semibold shrink-0">
                    {item.result}
                  </p>
                </div>

                <p className="text-gray-400 text-[10px] mt-1.5">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
