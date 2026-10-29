import { useMemo, useState } from 'react';
import { useFollowUps } from './hooks/useFollowUps';
import {
  Search,
  Plus,
  RotateCcw,
  Download,
  Trash2,
  Pencil,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarClock,
  Phone,
  User,
} from 'lucide-react';

/* ----------------------------- Local Storage ----------------------------- */


const STATUS_STYLES = {
  'Due Today': 'bg-amber-50 text-amber-600 border border-amber-200',
  Overdue: 'bg-rose-50 text-rose-600 border border-rose-200',
  Upcoming: 'bg-sky-50 text-sky-600 border border-sky-200',
  Completed: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
};

const PRIORITY_STYLES = {
  High: 'bg-rose-50 text-rose-600 border border-rose-100',
  Medium: 'bg-amber-50 text-amber-600 border border-amber-100',
  Low: 'bg-slate-100 text-slate-500 border border-slate-200',
};

const EMPTY_FORM = {
  client: '',
  property: '',
  dueDate: '',
  priority: 'Medium',
  status: 'Upcoming',
  note: '',
  phone: '',
};

const COLORS = [
  'bg-sky-500',
  'bg-emerald-500',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-fuchsia-500',
  'bg-violet-500',
];

function initials(name) {
  return name
    ? name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CU';
}

/* ----------------------------- Export Helper ----------------------------- */

function exportPDF(data) {
  const printWindow = window.open('', '_blank');

  if (!printWindow) return;

  const rowsHtml = data
    .map(
      (f) => `
        <tr>
          <td>${f.client}</td>
          <td>${f.property}</td>
          <td>${f.dueDate}</td>
          <td>${f.priority}</td>
          <td>${f.status}</td>
          <td>${f.phone || '-'}</td>
          <td>${f.note || '-'}</td>
        </tr>
      `
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Follow-ups Report</title>

        <style>
          body {
            font-family:
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              Roboto,
              sans-serif;
            padding: 24px;
            color: #1e293b;
          }

          h1 {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 4px;
            color: #0f172a;
          }

          p {
            font-size: 12px;
            color: #64748b;
            margin-top: 0;
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 12px;
          }

          th {
            background: #f8fafc;
            padding: 10px 8px;
            border-bottom: 2px solid #cbd5e1;
            font-weight: 600;
            color: #475569;
          }

          td {
            padding: 10px 8px;
            border-bottom: 1px solid #e2e8f0;
          }

          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>

      <body>
        <h1>Follow-ups Report</h1>

        <p>
          Generated on ${new Date().toLocaleDateString()}
        </p>

        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Property</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Phone</th>
              <th>Note</th>
            </tr>
          </thead>

          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 250);
}

/* ------------------------------- Stat Card ------------------------------- */

function StatCard({ label, value, sub, icon: Icon, bg, fg }) {
  return (
    <div className="flex-1 min-w-[190px] bg-white rounded-xl border border-slate-100 px-4 py-4 flex items-start gap-3 shadow-xs">
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

        <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

/* --------------------------- Add/Edit Modal --------------------------- */

function FollowUpModal({ initialData, onClose, onSave }) {
  const [form, setForm] = useState(initialData || EMPTY_FORM);
  const [error, setError] = useState('');

  const update = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    if (!form.client.trim() || !form.dueDate.trim()) {
      setError('Client and Due Date are required.');
      return;
    }

    const item = {
      ...form,

      id: form.id,

      client: form.client.trim(),

      property: form.property.trim() || '-',

      dueDate: form.dueDate,

      priority: form.priority || 'Medium',

      status: form.status || 'Upcoming',

      note: form.note.trim() || '-',

      phone: form.phone.trim() || '',

      color: form.color || COLORS[Math.floor(Math.random() * COLORS.length)],
    };

    onSave(item);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-[16px] font-semibold text-slate-800">
            {form.id ? 'Edit Follow-up' : 'Add Follow-up'}
          </h2>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="text-[12.5px] text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
              {error}
            </div>
          )}

          <div>
            <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
              Client Name *
            </label>

            <input
              value={form.client}
              onChange={update('client')}
              placeholder="e.g. Usman Khan"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
                Phone Number
              </label>

              <input
                value={form.phone}
                onChange={update('phone')}
                placeholder="e.g. +92 300 1234567"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            <div>
              <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
                Related Property
              </label>

              <input
                value={form.property}
                onChange={update('property')}
                placeholder="e.g. 10 Marla House"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
                Due Date *
              </label>

              <input
                value={form.dueDate}
                onChange={update('dueDate')}
                type="date"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            <div>
              <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
                Priority
              </label>

              <select
                value={form.priority}
                onChange={update('priority')}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
              >
                {['High', 'Medium', 'Low'].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
                Status
              </label>

              <select
                value={form.status}
                onChange={update('status')}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
              >
                {['Due Today', 'Overdue', 'Upcoming', 'Completed'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
              Follow-up Note
            </label>

            <textarea
              value={form.note}
              onChange={update('note')}
              rows={3}
              placeholder="What needs to happen in this follow-up?"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 sticky bottom-0 bg-white z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-[#0b1830] text-white text-[13px] font-medium hover:bg-[#0f2140] transition"
          >
            {form.id ? 'Update Follow-up' : 'Save Follow-up'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Quick Call Modal ---------------------------- */

function PhoneModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div
            className={`w-14 h-14 rounded-full ${item.color} flex items-center justify-center text-white text-lg font-bold mb-3 shadow-md`}
          >
            {initials(item.client)}
          </div>

          <h3 className="text-base font-semibold text-slate-800">
            {item.client}
          </h3>

          <p className="text-xs text-slate-400 mt-0.5">{item.property}</p>

          <div className="mt-4 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl w-full text-center">
            <span className="text-xs text-slate-400 block">Phone Number</span>

            <span className="text-sm font-semibold text-slate-700">
              {item.phone || 'No phone number'}
            </span>
          </div>

          {item.phone && (
            <div className="flex items-center gap-2 w-full mt-5">
              <a
                href={`tel:${item.phone}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
              >
                <Phone className="w-4 h-4" />
                Call Client
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Follow-up Row ------------------------------- */

function FollowUpRow({ f, onToggleComplete, onEdit, onDelete, onCall }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-4 px-5 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition">
      <div
        className={`w-9 h-9 rounded-full ${f.color} flex items-center justify-center text-white text-[12px] font-medium shrink-0 shadow-xs`}
      >
        {initials(f.client)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13.5px] font-semibold text-slate-800">
            {f.client}
          </span>

          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
              PRIORITY_STYLES[f.priority]
            }`}
          >
            {f.priority}
          </span>

          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
              STATUS_STYLES[f.status]
            }`}
          >
            {f.status}
          </span>
        </div>

        <div className="text-[12.5px] font-medium text-slate-600 mt-1">
          {f.property}
        </div>

        <div className="text-[12.5px] text-slate-400 mt-0.5">{f.note}</div>

        <div className="flex items-center gap-1.5 text-[11.5px] text-slate-400 mt-2">
          <CalendarClock className="w-3.5 h-3.5" />
          Due {f.dueDate}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onToggleComplete(f.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${
            f.status === 'Completed'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />

          {f.status === 'Completed' ? 'Completed' : 'Mark Done'}
        </button>

        <button
          onClick={() => onCall(f)}
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition"
          title="Call Client"
        >
          <Phone className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onEdit(f)}
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition"
          title="Edit Follow-up"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onDelete(f.id)}
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-rose-500 hover:bg-rose-50 transition"
          title="Delete Follow-up"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------- Page ---------------------------------- */

export default function FollowUpsPage() {
  const { followups, addFollowUp, updateFollowUp, deleteFollowUpById } =
    useFollowUps();

  const [modalMode, setModalMode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [callItem, setCallItem] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [priorityFilter, setPriorityFilter] = useState('All Priority');

  /* ----------------------------- Save Item ----------------------------- */

  const handleSave = async (item) => {
    try {
      if (modalMode === 'edit') {
        await updateFollowUp(item.id, item);
      } else {
        await addFollowUp(item);
      }
    } catch (error) {
      console.error(error);
      alert('Could not save follow-up.');
      return;
    }

    setModalMode(null);
    setSelectedItem(null);
  };

  /* ---------------------------- Delete Item ---------------------------- */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this follow-up?'
    );

    if (!confirmed) return;

    try {
      await deleteFollowUpById(id);
    } catch (error) {
      console.error(error);
      alert('Could not delete follow-up.');
    }
  };
  /* ------------------------- Toggle Completed ------------------------- */

  const handleToggleComplete = (id) => {
    const item = followups.find((f) => f.id === id);
    if (!item) return;

    updateFollowUp(id, {
      status: item.status === 'Completed' ? 'Upcoming' : 'Completed',
    });
  };

  /* ------------------------------- Filter ------------------------------- */

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return followups.filter((f) => {
      const statusOk =
        statusFilter === 'All Status' || f.status === statusFilter;

      const priorityOk =
        priorityFilter === 'All Priority' || f.priority === priorityFilter;

      const searchOk =
        !query ||
        f.client.toLowerCase().includes(query) ||
        f.property.toLowerCase().includes(query) ||
        f.note.toLowerCase().includes(query) ||
        f.phone.toLowerCase().includes(query);

      return statusOk && priorityOk && searchOk;
    });
  }, [followups, statusFilter, priorityFilter, searchQuery]);

  /* -------------------------------- Counts -------------------------------- */

  const counts = useMemo(
    () => ({
      total: followups.length,

      dueToday: followups.filter((f) => f.status === 'Due Today').length,

      overdue: followups.filter((f) => f.status === 'Overdue').length,

      completed: followups.filter((f) => f.status === 'Completed').length,
    }),
    [followups]
  );

  /* -------------------------------- Render -------------------------------- */

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
        {/* Header */}

        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-slate-800">
              Follow-ups
            </h1>

            <p className="text-[13px] text-slate-400 mt-0.5">
              Stay on top of every client and deal that needs attention.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => exportPDF(filtered)}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-600 hover:bg-slate-50 transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" strokeWidth={1.8} />
              Export PDF
            </button>

            <button
              onClick={() => {
                setSelectedItem(null);
                setModalMode('add');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0b1830] text-white text-[13px] font-medium hover:bg-[#0f2140] transition shadow-xs"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Add Follow-up
            </button>
          </div>
        </div>

        {/* Stats */}

        <div className="flex flex-wrap gap-4 mb-6">
          <StatCard
            label="Total Follow-ups"
            value={counts.total}
            sub="All records"
            icon={User}
            bg="bg-sky-50"
            fg="text-sky-500"
          />

          <StatCard
            label="Due Today"
            value={counts.dueToday}
            sub="Needs action now"
            icon={Clock}
            bg="bg-amber-50"
            fg="text-amber-500"
          />

          <StatCard
            label="Overdue"
            value={counts.overdue}
            sub="Past due date"
            icon={AlertCircle}
            bg="bg-rose-50"
            fg="text-rose-500"
          />

          <StatCard
            label="Completed"
            value={counts.completed}
            sub="Resolved"
            icon={CheckCircle2}
            bg="bg-emerald-50"
            fg="text-emerald-500"
          />
        </div>

        {/* Filters */}

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              placeholder="Search follow-ups, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-[13px] text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-600 focus:outline-none cursor-pointer"
          >
            {[
              'All Status',
              'Due Today',
              'Overdue',
              'Upcoming',
              'Completed',
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-600 focus:outline-none cursor-pointer"
          >
            {['All Priority', 'High', 'Medium', 'Low'].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setStatusFilter('All Status');
              setPriorityFilter('All Priority');
              setSearchQuery('');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-600 hover:bg-slate-50 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Follow-up List */}

        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs">
          {followups.length === 0 ? (
            <div className="py-16 px-5 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <CalendarClock className="w-5 h-5 text-slate-400" />
              </div>

              <h3 className="text-sm font-semibold text-slate-700">
                No follow-ups yet
              </h3>

              <p className="text-[13px] text-slate-400 mt-1">
                Add your first follow-up to start managing client reminders.
              </p>

              <button
                onClick={() => {
                  setSelectedItem(null);
                  setModalMode('add');
                }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0b1830] text-white text-[13px] font-medium hover:bg-[#0f2140] transition"
              >
                <Plus className="w-4 h-4" />
                Add Follow-up
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-[13.5px]">
              No follow-ups match your criteria.
            </div>
          ) : (
            filtered.map((f) => (
              <FollowUpRow
                key={f.id}
                f={f}
                onToggleComplete={handleToggleComplete}
                onEdit={(item) => {
                  setSelectedItem(item);
                  setModalMode('edit');
                }}
                onDelete={handleDelete}
                onCall={(item) => setCallItem(item)}
              />
            ))
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}

      {modalMode && (
        <FollowUpModal
          initialData={selectedItem}
          onClose={() => {
            setModalMode(null);
            setSelectedItem(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* Phone Modal */}

      {callItem && (
        <PhoneModal item={callItem} onClose={() => setCallItem(null)} />
      )}
    </div>
  );
}
