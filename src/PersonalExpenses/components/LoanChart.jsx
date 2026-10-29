import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';

export default function LoanChart({ totalGiven, totalTaken }) {
  if (!totalGiven && !totalTaken) {
    return (
      <Card>
        <EmptyState
          message="No loan data to visualize yet"
          subMessage="Add a loan record to see the chart here."
        />
      </Card>
    );
  }

  const data = [
    { name: 'Given', value: totalGiven },
    { name: 'Taken', value: totalTaken },
  ];

  return (
    <Card>
      <h3 className="text-gray-900 font-medium mb-4">Loan Given vs Taken</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.navy[700]} />
          <XAxis
            dataKey="name"
            tick={{ fill: colors.text.muted, fontSize: 12 }}
          />
          <YAxis tick={{ fill: colors.text.muted, fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: colors.navy[800],
              border: `1px solid ${colors.navy[700]}`,
              borderRadius: 8,
            }}
            formatter={(value) => [`PKR ${value.toLocaleString()}`, '']}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            <Cell fill={colors.accent.orange} />
            <Cell fill={colors.accent.purple} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
