import { FiInbox } from 'react-icons/fi';

export default function EmptyState({
  icon: Icon = FiInbox,
  message = 'Nothing here yet',
  subMessage,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-gray-100 rounded-full p-4 mb-3">
        <Icon size={28} className="text-gray-400" />
      </div>
      <p className="text-gray-800 font-medium">{message}</p>
      {subMessage && (
        <p className="text-gray-500 text-sm mt-1 max-w-xs">{subMessage}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
