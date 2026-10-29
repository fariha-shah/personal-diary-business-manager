import { useState } from 'react';
import {
  Bell,
  Search,
  ChevronDown,
  Download,
  TrendingUp,
  Handshake,
  Percent,
  Wallet,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

/* ------------------------------- Data ------------------------------- */

const REVENUE_DATA = [
  { month: 'Feb', revenue: 68 },
  { month: 'Mar', revenue: 82 },
  { month: 'Apr', revenue: 74 },
  { month: 'May', revenue: 95 },
  { month: 'Jun', revenue: 88 },
  { month: 'Jul', revenue: 125 },
];

const DEALS_BY_STATUS = [
  { status: 'Won', deals: 34 },
  { status: 'In Progress', deals: 21 },
  { status: 'Lost', deals: 9 },
  { status: 'On Hold', deals: 6 },
];

const PAYMENT_METHOD_SPLIT = [
  { name: 'Bank Transfer', value: 45 },
  { name: 'Cash', value: 28 },
  { name: 'Cheque', value: 27 },
];

const PIE_COLORS = ['#0ea5e9', '#f59e0b', '#8b5cf6'];

const TOP_PROPERTIES = [
  {
    property: 'Commercial Plaza - Gulberg',
    deals: 3,
    revenue: '36,000,000',
    status: 'Sold',
  },
  {
    property: '10 Marla House - DHA Phase 6',
    deals: 2,
    revenue: '9,000,000',
    status: 'Sold',
  },
  {
    property: '2 Kanal Farm House - Bedian Road',
    deals: 1,
    revenue: '6,500,000',
    status: 'Rented',
  },
  {
    property: '1 Kanal Plot - DHA Phase 5',
    deals: 2,
    revenue: '5,600,000',
    status: 'Sold',
  },
  {
    property: 'Office Space - MM Alam Road',
    deals: 1,
    revenue: '3,200,000',
    status: 'Rented',
  },
];

const STATUS_STYLES = {
  Sold: 'bg-rose-50 text-rose-600',
  Rented: 'bg-amber-50 text-amber-600',
  Available: 'bg-emerald-50 text-emerald-600',
};

/* ---------------------------------- Top bar ---------------------------------- */

function TopBar() {
  return (
    <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100">
      <div className="relative w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search reports..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-[13px] text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
      </div>
      <div className="flex items-center gap-5">
        <button className="relative">
          <Bell className="w-5 h-5 text-slate-400" strokeWidth={1.8} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-[12px] font-medium">
            RZ
          </div>
          <div>
            <div className="text-[13px] font-medium text-slate-800 leading-tight">
              Rana Zahid
            </div>
            <div className="text-[11px] text-slate-400 leading-tight">
              Property Dealer
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Stat card --------------------------------- */

function StatCard({ label, value, sub, subColor, icon: Icon, bg, fg }) {
  return (
    <div className="flex-1 min-w-[190px] bg-white rounded-xl border border-slate-100 px-4 py-4 flex items-start gap-3">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bg}`}
      >
        <Icon className={`w-5 h-5 ${fg}`} strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <div className="text-[12px] text-slate-400">{label}</div>
        <div className="text-[16px] font-semibold text-slate-800 mt-0.5 truncate">
          {value}
        </div>
        <div className={`text-[11px] mt-0.5 ${subColor || 'text-slate-400'}`}>
          {sub}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Chart card --------------------------------- */

function ChartCard({ title, sub, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5">
      <div className="mb-4">
        <div className="text-[14px] font-semibold text-slate-800">{title}</div>
        {sub && <div className="text-[12px] text-slate-400 mt-0.5">{sub}</div>}
      </div>
      {children}
    </div>
  );
}

/* ----------------------------------- Page ----------------------------------- */

export default function ReportsPage() {
  const [range, setRange] = useState('Last 6 Months');

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 font-sans overflow-hidden">
      <TopBar />

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-[22px] font-semibold text-slate-800">
              Reports
            </h1>
            <p className="text-[13px] text-slate-400 mt-0.5">
              Track revenue, deal performance, and top properties.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-600 focus:outline-none"
            >
              {['Last 6 Months', 'Last 3 Months', 'This Year', 'Last Year'].map(
                (r) => (
                  <option key={r}>{r}</option>
                )
              )}
            </select>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-600 hover:bg-slate-50">
              <Download className="w-4 h-4" strokeWidth={1.8} />
              Export Report
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="flex flex-wrap gap-4 mb-6">
          <StatCard
            label="Total Revenue"
            value="PKR 125,450,000"
            sub="↑ 13.6% from last month"
            subColor="text-emerald-500"
            icon={TrendingUp}
            bg="bg-emerald-50"
            fg="text-emerald-500"
          />
          <StatCard
            label="Total Deals Closed"
            value="34"
            sub="This period"
            icon={Handshake}
            bg="bg-sky-50"
            fg="text-sky-500"
          />
          <StatCard
            label="Conversion Rate"
            value="48%"
            sub="Leads to closed deals"
            icon={Percent}
            bg="bg-violet-50"
            fg="text-violet-500"
          />
          <StatCard
            label="Avg. Deal Size"
            value="PKR 3,690,000"
            sub="Per closed transaction"
            icon={Wallet}
            bg="bg-amber-50"
            fg="text-amber-500"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <div className="lg:col-span-2">
            <ChartCard
              title="Revenue Trend"
              sub="Monthly revenue in PKR (millions)"
            >
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={REVENUE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: '1px solid #f1f5f9',
                    }}
                    formatter={(v) => [`PKR ${v}M`, 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Payment Methods" sub="Share of received payments">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={PAYMENT_METHOD_SPLIT}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {PAYMENT_METHOD_SPLIT.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: '1px solid #f1f5f9',
                  }}
                  formatter={(v) => [`${v}%`, '']}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mb-6">
          <ChartCard
            title="Deals by Status"
            sub="Breakdown of all deals this period"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={DEALS_BY_STATUS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: '1px solid #f1f5f9',
                  }}
                />
                <Bar
                  dataKey="deals"
                  fill="#0b1830"
                  radius={[6, 6, 0, 0]}
                  barSize={44}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Top properties table */}
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="text-[14px] font-semibold text-slate-800">
              Top Performing Properties
            </div>
            <div className="text-[12px] text-slate-400 mt-0.5">
              Ranked by revenue generated this period
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11.5px] text-slate-400 uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Property</th>
                <th className="px-5 py-3 font-medium">Deals</th>
                <th className="px-5 py-3 font-medium">Revenue (PKR)</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {TOP_PROPERTIES.map((p) => (
                <tr
                  key={p.property}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 text-[13px]"
                >
                  <td className="px-5 py-3.5 text-slate-700 font-medium">
                    {p.property}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{p.deals}</td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium">
                    {p.revenue}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11.5px] font-medium ${STATUS_STYLES[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
