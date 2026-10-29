import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePayments } from '../Payment/hooks/usePayments';
import { useExpenses } from '../PersonalExpenses/hooks/useExpenses';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Building2,
  Users,
  ClipboardList,
  Images,
  ArrowRight,
  Target,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// --------------------------------------------------
// Empty dashboard data
// Replace this with Firebase/API data later.
// --------------------------------------------------



// --------------------------------------------------
// Helpers
// --------------------------------------------------

function money(amount) {
  const value = Number(amount) || 0;

  return `PKR ${value.toLocaleString('en-PK')}`;
}

// --------------------------------------------------
// Card
// --------------------------------------------------

const Card = React.forwardRef(function Card({ children, className = '' }, ref) {
  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-gray-100 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
});

// --------------------------------------------------
// Metric Card
// --------------------------------------------------

function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  iconBg,
  iconFg,
}) {
  const isPositive = trend === 'up';

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400">{title}</p>

          <h3 className="mt-1 text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? money(value) : value}
          </h3>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className={`h-5 w-5 ${iconFg}`} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-gray-50 pt-3 text-xs">
        {trendValue !== undefined && trendValue !== null && (
          <span
            className={`flex items-center font-semibold ${
              isPositive ? 'text-emerald-600' : 'text-rose-500'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />
            )}

            {Number(trendValue) > 0 ? `+${trendValue}%` : `${trendValue}%`}
          </span>
        )}

        <span className="text-gray-400">{subtitle}</span>
      </div>
    </Card>
  );
}

// --------------------------------------------------
// Empty Chart State
// --------------------------------------------------

function EmptyChart() {
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
      <TrendingUp className="h-8 w-8 text-gray-300" />

      <p className="mt-3 text-sm font-medium text-gray-500">
        No financial data available
      </p>

      <p className="mt-1 text-xs text-gray-400">
        Financial data will appear here once transactions are added.
      </p>
    </div>
  );
}

// --------------------------------------------------
// Empty Transactions State
// --------------------------------------------------

function EmptyTransactions() {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
      <DollarSign className="h-8 w-8 text-gray-300" />

      <p className="mt-3 text-sm font-medium text-gray-500">
        No transactions available
      </p>

      <p className="mt-1 text-xs text-gray-400">
        Transactions will appear here once payment data is available.
      </p>
    </div>
  );
}

// --------------------------------------------------
// Business Dashboard
// --------------------------------------------------

export default function BusinessDashboard() {
  const [timeframe, setTimeframe] = useState('This Month');

  const { payments } = usePayments();
  const { expenses } = useExpenses();

  // --------------------------------------------------
  // Real KPIs derived from the shared Firestore collections.
  //
  // Note: "commission" and "target" aren't tracked anywhere in the app
  // yet (no field for them exists on a payment or property), so they
  // stay at 0 for now rather than showing a made-up number. Add a
  // commission-rate/target field to Settings later if you want these live.
  // --------------------------------------------------

  const activeData = useMemo(() => {
    const received = payments.filter((p) => p.status === 'Received');

    const revenue = received.reduce(
      (sum, p) => sum + (Number(p.amount ?? p.amountReceived ?? 0) || 0),
      0
    );

    const totalExpenses = expenses.reduce(
      (sum, e) => sum + (Number(e.amount) || 0),
      0
    );

    // Group received payments by month for the trend chart
    const monthTotals = {};
    received.forEach((p) => {
      const dateStr = p.date || p.paymentDate || p.createdAt;
      if (!dateStr) return;

      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return;

      const key = d.toLocaleDateString('en-US', { month: 'short' });
      monthTotals[key] = (monthTotals[key] || 0) + (Number(p.amount ?? p.amountReceived ?? 0) || 0);
    });

    const chart = Object.entries(monthTotals).map(([month, total]) => ({
      month,
      revenue: total,
      netProfit: total - totalExpenses / Math.max(Object.keys(monthTotals).length, 1),
    }));

    const transactions = received
      .slice(0, 10)
      .map((p) => ({
        id: p.invoiceRef || p.id,
        agent: 'Rana Zahid',
        client: p.client || '—',
        category: p.property || '—',
        amount: Number(p.amount ?? p.amountReceived ?? 0) || 0,
        commission: 0,
        status: p.status || 'Received',
      }));

    return {
      chart,
      kpis: {
        revenue,
        revenueTrend: 0,
        commission: 0,
        commissionTrend: 0,
        expenses: totalExpenses,
        expensesTrend: 0,
        avgRate: 0,
        targetAmount: 0,
        targetProgress: 0,
      },
      transactions,
    };
  }, [payments, expenses]);

  // --------------------------------------------------
  // Export PDF
  // --------------------------------------------------

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.setTextColor(36, 54, 106);

      doc.text('Business Performance & Financial Report', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);

      doc.text(`Timeframe: ${timeframe}`, 14, 28);

      doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 14, 34);

      doc.setFontSize(12);
      doc.setTextColor(0);

      doc.text('Key Performance Indicators', 14, 44);

      doc.setFontSize(9);
      doc.setTextColor(80);

      doc.text(
        `Total Gross Revenue: ${money(activeData.kpis.revenue)}`,
        14,
        52
      );

      doc.text(
        `Commission Earned: ${money(activeData.kpis.commission)}`,
        14,
        58
      );

      doc.text(`Total Expenses: ${money(activeData.kpis.expenses)}`, 100, 52);

      doc.text(`Target Progress: ${activeData.kpis.targetProgress}%`, 100, 58);

      doc.setFontSize(12);
      doc.setTextColor(0);

      doc.text('Transaction Summary', 14, 70);

      const tableHeaders = [
        [
          'ID',
          'Agent',
          'Client / Deal',
          'Category',
          'Amount',
          'Commission',
          'Status',
        ],
      ];

      const tableData = activeData.transactions.map((transaction) => [
        transaction.id,
        transaction.agent,
        transaction.client,
        transaction.category,
        money(transaction.amount),
        money(transaction.commission),
        transaction.status,
      ]);

      if (tableData.length > 0) {
        doc.autoTable({
          startY: 75,
          head: tableHeaders,
          body: tableData,
          theme: 'striped',
          headStyles: {
            fillColor: [8, 145, 178],
          },
          styles: {
            fontSize: 8,
          },
        });
      } else {
        doc.setFontSize(10);
        doc.setTextColor(100);

        doc.text('No transactions available for this report.', 14, 78);
      }

      doc.save(`Business_Report_${timeframe.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-gray-50 p-8 font-sans">
      <div className="space-y-6">
        {/* --------------------------------------------------
            Header
        -------------------------------------------------- */}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Business Dashboard
            </h1>

            <p className="mt-1 text-xs text-gray-500">
              Financial performance and revenue analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={timeframe}
              onChange={(event) => setTimeframe(event.target.value)}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="This Month">This Month</option>
              <option value="Last Quarter">Last Quarter</option>
              <option value="Year to Date (YTD)">Year to Date (YTD)</option>
            </select>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-700 to-teal-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:from-cyan-800 hover:to-teal-700 active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              Export PDF
            </button>
          </div>
        </div>

        {/* --------------------------------------------------
            Quick Links
        -------------------------------------------------- */}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link
            to="/business/properties"
            className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 transition hover:border-cyan-200 hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                <Building2 size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-400">Manage</p>

                <p className="text-sm font-semibold text-gray-800">
                  Properties
                </p>
              </div>
            </div>

            <ArrowRight
              size={16}
              className="text-gray-300 transition group-hover:text-cyan-600"
            />
          </Link>

          <Link
            to="/business/clients"
            className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 transition hover:border-cyan-200 hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <Users size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-400">View All</p>

                <p className="text-sm font-semibold text-gray-800">Clients</p>
              </div>
            </div>

            <ArrowRight
              size={16}
              className="text-gray-300 transition group-hover:text-teal-600"
            />
          </Link>

          <Link
            to="/business/followups"
            className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 transition hover:border-cyan-200 hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <ClipboardList size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-400">Pending</p>

                <p className="text-sm font-semibold text-gray-800">
                  Follow-ups
                </p>
              </div>
            </div>

            <ArrowRight
              size={16}
              className="text-gray-300 transition group-hover:text-amber-600"
            />
          </Link>

          <Link
            to="/business/gallery"
            className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 transition hover:border-cyan-200 hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                <Images size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-400">Browse</p>

                <p className="text-sm font-semibold text-gray-800">Gallery</p>
              </div>
            </div>

            <ArrowRight
              size={16}
              className="text-gray-300 transition group-hover:text-indigo-600"
            />
          </Link>
        </div>

        {/* --------------------------------------------------
            Revenue Goal
        -------------------------------------------------- */}

        <Card className="bg-gradient-to-r from-slate-900 to-cyan-950 p-5 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/20 text-cyan-400">
                <Target className="h-5 w-5" />
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                  Period Revenue Goal
                  <span className="rounded-full border border-cyan-500/30 bg-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300">
                    {timeframe}
                  </span>
                </h3>

                <p className="mt-0.5 text-xs text-slate-400">
                  Target:{' '}
                  <span className="font-medium text-white">
                    {money(activeData.kpis.targetAmount)}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-slate-400">Achieved So Far</p>

                <p className="text-lg font-bold text-cyan-400">
                  {money(activeData.kpis.revenue)}
                </p>
              </div>

              <div className="h-3 w-24 overflow-hidden rounded-full border border-slate-700 bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-500"
                  style={{
                    width: `${activeData.kpis.targetProgress}%`,
                  }}
                />
              </div>

              <span className="text-sm font-bold text-teal-300">
                {activeData.kpis.targetProgress}%
              </span>
            </div>
          </div>
        </Card>

        {/* --------------------------------------------------
            Metric Cards
        -------------------------------------------------- */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Gross Revenue"
            value={activeData.kpis.revenue}
            subtitle="No data available"
            trend="up"
            trendValue={activeData.kpis.revenueTrend}
            icon={TrendingUp}
            iconBg="bg-cyan-50"
            iconFg="text-cyan-700"
          />

          <MetricCard
            title="Commission Earned"
            value={activeData.kpis.commission}
            subtitle="No data available"
            trend="up"
            trendValue={activeData.kpis.commissionTrend}
            icon={DollarSign}
            iconBg="bg-teal-50"
            iconFg="text-teal-600"
          />

          <MetricCard
            title="Total Expenses"
            value={activeData.kpis.expenses}
            subtitle="No data available"
            trend="down"
            trendValue={activeData.kpis.expensesTrend}
            icon={ArrowDownRight}
            iconBg="bg-rose-50"
            iconFg="text-rose-500"
          />

          <MetricCard
            title="Avg Commission Rate"
            value={`${activeData.kpis.avgRate}%`}
            subtitle="No data available"
            trend="up"
            trendValue={0}
            icon={PieChartIcon}
            iconBg="bg-amber-50"
            iconFg="text-amber-600"
          />
        </div>

        {/* --------------------------------------------------
            Charts
        -------------------------------------------------- */}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="space-y-4 p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Revenue & Profit Growth
                </h3>

                <p className="text-xs text-gray-400">
                  Filtered by: {timeframe}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-600" />
                  Revenue
                </span>

                <span className="flex items-center gap-1.5 text-gray-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                  Net Profit
                </span>
              </div>
            </div>

            {activeData.chart.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={activeData.chart}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -20,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#0891b2"
                          stopOpacity={0.2}
                        />

                        <stop
                          offset="95%"
                          stopColor="#0891b2"
                          stopOpacity={0}
                        />
                      </linearGradient>

                      <linearGradient
                        id="colorProfit"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#0d9488"
                          stopOpacity={0.2}
                        />

                        <stop
                          offset="95%"
                          stopColor="#0d9488"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 11,
                        fill: '#9ca3af',
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: '#9ca3af',
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `PKR ${value}M`}
                    />

                    <Tooltip formatter={(value) => `PKR ${value} Million`} />

                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0891b2"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenue"
                    />

                    <Area
                      type="monotone"
                      dataKey="netProfit"
                      stroke="#0d9488"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorProfit)"
                      name="Net Profit"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart />
            )}
          </Card>

          {/* --------------------------------------------------
              Revenue Categories
          -------------------------------------------------- */}

          <Card className="space-y-4 p-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Revenue Stream Share
              </h3>

              <p className="text-xs text-gray-400">
                Distribution across categories
              </p>
            </div>

            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
              <PieChartIcon className="h-8 w-8 text-gray-300" />

              <p className="mt-3 text-sm font-medium text-gray-500">
                No category data available
              </p>

              <p className="mt-1 text-center text-xs text-gray-400">
                Revenue categories will appear here once transactions are added.
              </p>
            </div>
          </Card>
        </div>

        {/* --------------------------------------------------
            Transactions
        -------------------------------------------------- */}

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Recent Transactions
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Financial transactions for {timeframe}
              </p>
            </div>
          </div>

          {activeData.transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                    <th className="px-3 py-3 font-medium">ID</th>

                    <th className="px-3 py-3 font-medium">Agent</th>

                    <th className="px-3 py-3 font-medium">Client / Deal</th>

                    <th className="px-3 py-3 font-medium">Category</th>

                    <th className="px-3 py-3 text-right font-medium">Amount</th>

                    <th className="px-3 py-3 text-right font-medium">
                      Commission
                    </th>

                    <th className="px-3 py-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {activeData.transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-3 py-3 font-medium text-gray-700">
                        {transaction.id}
                      </td>

                      <td className="px-3 py-3 text-gray-600">
                        {transaction.agent}
                      </td>

                      <td className="px-3 py-3 text-gray-600">
                        {transaction.client}
                      </td>

                      <td className="px-3 py-3 text-gray-600">
                        {transaction.category}
                      </td>

                      <td className="px-3 py-3 text-right font-medium text-gray-800">
                        {money(transaction.amount)}
                      </td>

                      <td className="px-3 py-3 text-right font-medium text-gray-800">
                        {money(transaction.commission)}
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            transaction.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyTransactions />
          )}
        </Card>
      </div>
    </div>
  );
}
