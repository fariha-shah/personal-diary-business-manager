import {
  FiTrendingDown,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiCreditCard,
} from 'react-icons/fi';

import Card from '../../components/common/Card';

export default function SummaryCards({
  totalSpent = 0,
  totalGiven = 0,
  totalTaken = 0,
  netLoan = 0,
}) {
  const cards = [
    {
      label: 'Total Spent',
      value: `PKR ${Number(totalSpent).toLocaleString()}`,
      icon: FiTrendingDown,
      cardBg: '!bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
      valueColor: 'text-red-600',
    },
    {
      label: 'Loan Given',
      value: `PKR ${Number(totalGiven).toLocaleString()}`,
      icon: FiArrowUpRight,
      cardBg: '!bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
      valueColor: 'text-blue-600',
    },
    {
      label: 'Loan Taken',
      value: `PKR ${Number(totalTaken).toLocaleString()}`,
      icon: FiArrowDownLeft,
      cardBg: '!bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-500',
      valueColor: 'text-purple-600',
    },
    {
      label: 'Net Loan Balance',
      value: `PKR ${Number(netLoan).toLocaleString()}`,
      icon: FiCreditCard,
      cardBg: '!bg-emerald-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-500',
      valueColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.label}
            hoverable
            className={`
              ${card.cardBg}
              border border-white
              shadow-sm
              hover:shadow-md
              transition-all duration-200
              animate-[fadeIn_0.35s_ease-out]
            `}
            style={{
              animationDelay: `${index * 60}ms`,
              animationFillMode: 'backwards',
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-gray-500 text-sm font-medium">
                  {card.label}
                </p>
                <p
                  className={`
                    ${card.valueColor}
                    text-xl sm:text-2xl
                    font-semibold
                    mt-2
                    tracking-tight
                    truncate
                  `}
                >
                  {card.value}
                </p>
              </div>
              <div
                className={`
                  ${card.iconBg}
                  ${card.iconColor}
                  flex h-10 w-10
                  shrink-0
                  items-center justify-center
                  rounded-xl
                `}
              >
                <Icon size={19} strokeWidth={2} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
