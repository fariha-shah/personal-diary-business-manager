import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';

const CHART_COLORS = [
  colors.accent.blue,
  colors.accent.teal,
  colors.accent.orange,
  colors.accent.green,
  colors.accent.red,
  colors.accent.purple,
  '#F472B6',
  '#FACC15',
  '#38BDF8',
  '#A3E635',
  '#FB923C',
];

const tooltipStyle = {
  background: colors.navy[800],
  border: `1px solid ${colors.navy[700]}`,
  borderRadius: 8,
  fontSize: 13,
};

export default function ExpenseCharts({ expenses }) {
  if (!expenses.length) {
    return (
      <Card>
        <EmptyState
          message="No data to visualize yet"
          subMessage="Add a few expenses to see charts here."
        />
      </Card>
    );
  }

  const categoryTotals = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] =
      (categoryTotals[e.category] || 0) + Number(e.amount);
  });
  const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  const dateTotals = {};
  expenses.forEach((e) => {
    dateTotals[e.date] = (dateTotals[e.date] || 0) + Number(e.amount);
  });
  const trendData = Object.entries(dateTotals)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <h3 className="text-gray-900 font-medium mb-4">Spending by Category</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
            >
              {categoryData.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: colors.text.primary }}
              formatter={(value) => [`PKR ${value.toLocaleString()}`, '']}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: colors.text.secondary }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className="text-gray-900 font-medium mb-4">Spending Trend</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.navy[700]} />
            <XAxis
              dataKey="date"
              tick={{ fill: colors.text.muted, fontSize: 11 }}
            />
            <YAxis tick={{ fill: colors.text.muted, fontSize: 11 }} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: colors.text.primary }}
              formatter={(value) => [`PKR ${value.toLocaleString()}`, 'Spent']}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke={colors.accent.blue}
              strokeWidth={2}
              dot={{ r: 3, fill: colors.accent.blue }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
