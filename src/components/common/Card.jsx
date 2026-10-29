export default function Card({
  children,
  className = '',
  hoverable = false,
  padding = 'p-5',
  style,
}) {
  return (
    <div
      style={style}
      className={`
        bg-white border border-gray-100 rounded-2xl shadow-sm
        ${padding}
        ${hoverable ? 'transition-all duration-300 hover:border-blue-300 hover:-translate-y-0.5' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
