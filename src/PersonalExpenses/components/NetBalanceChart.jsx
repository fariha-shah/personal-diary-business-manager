import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';

export default function NetBalanceChart({ expenses = [], loanRecords = [] }) {
  const data = useMemo(() => {
    const grouped = {};

    expenses.forEach((expense) => {
      const date = expense.date;
      if (!date) return;
      if (!grouped[date]) {
        grouped[date] = { date, expenses: 0, loanGiven: 0, loanTaken: 0 };
      }
      grouped[date].expenses += Number(expense.amount || 0);
    });

    loanRecords.forEach((loan) => {
      const date = loan.date;
      if (!date) return;
      if (!grouped[date]) {
        grouped[date] = { date, expenses: 0, loanGiven: 0, loanTaken: 0 };
      }
      if (loan.type === 'Given') {
        grouped[date].loanGiven += Number(loan.amount || 0);
      }
      if (loan.type === 'Taken') {
        grouped[date].loanTaken += Number(loan.amount || 0);
      }
    });

    return Object.values(grouped)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => ({
        ...item,
        displayDate: new Date(item.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      }));
  }, [expenses, loanRecords]);

  const totals = useMemo(() => {
    return data.reduce(
      (acc, item) => ({
        expenses: acc.expenses + item.expenses,
        loanGiven: acc.loanGiven + item.loanGiven,
        loanTaken: acc.loanTaken + item.loanTaken,
      }),
      { expenses: 0, loanGiven: 0, loanTaken: 0 }
    );
  }, [data]);

  if (!data.length) {
    return (
      <Card>
        <EmptyState
          message="No financial activity yet"
          subMessage="Add expenses or loan records to see your financial overview."
        />
      </Card>
    );
  }

  const formatAmount = (value) => `PKR ${Number(value).toLocaleString()}`;

  const formatAxisValue = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value;
  };

  return (
    <Card>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
        <div>
          <h3 className="text-gray-900 font-semibold text-base">
            Financial Overview
          </h3>
          <p className="text-gray-500 text-xs mt-1">
            Your expenses and loan activity over time
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-100">
            <p className="text-gray-400 text-[10px] sm:text-xs">Expenses</p>
            <p className="text-red-600 text-sm font-semibold mt-0.5">
              {formatAmount(totals.expenses)}
            </p>
          </div>
          <div className="px-3 py-2 rounded-lg bg-green-50 border border-green-100">
            <p className="text-gray-400 text-[10px] sm:text-xs">Loan Given</p>
            <p className="text-green-600 text-sm font-semibold mt-0.5">
              {formatAmount(totals.loanGiven)}
            </p>
          </div>
          <div className="px-3 py-2 rounded-lg bg-purple-50 border border-purple-100">
            <p className="text-gray-400 text-[10px] sm:text-xs">Loan Taken</p>
            <p className="text-purple-600 text-sm font-semibold mt-0.5">
              {formatAmount(totals.loanTaken)}
            </p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
          barGap={4}
          barCategoryGap="22%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={colors.navy[700]}
            vertical={false}
          />
          <XAxis
            dataKey="displayDate"
            tick={{ fill: colors.text.muted, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tick={{ fill: colors.text.muted, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatAxisValue}
            width={42}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.03)' }}
            contentStyle={{
              background: colors.navy[800],
              border: `1px solid ${colors.navy[700]}`,
              borderRadius: 10,
              padding: '10px 12px',
            }}
            labelStyle={{
              color: colors.text.primary,
              fontWeight: 600,
              marginBottom: 6,
            }}
            itemStyle={{ fontSize: 12 }}
            formatter={(value, name) => {
              const labels = {
                expenses: 'Expenses',
                loanGiven: 'Loan Given',
                loanTaken: 'Loan Taken',
              };
              return [formatAmount(value), labels[name] || name];
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{
              fontSize: 12,
              color: colors.text.secondary,
              paddingTop: 12,
            }}
            formatter={(value) => {
              const labels = {
                expenses: 'Expenses',
                loanGiven: 'Loan Given',
                loanTaken: 'Loan Taken',
              };
              return labels[value] || value;
            }}
          />
          <Bar
            dataKey="expenses"
            name="expenses"
            fill={colors.accent.red}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="loanGiven"
            name="loanGiven"
            fill={colors.accent.green}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="loanTaken"
            name="loanTaken"
            fill={colors.accent.purple}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
