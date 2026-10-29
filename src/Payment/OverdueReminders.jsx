import { useMemo, useRef, useState, useEffect } from 'react';
import { usePayments } from './hooks/usePayments';
import {
  Search,
  ChevronDown,
  AlertTriangle,
  Clock,
  Send,
  UserX,
  Download,
  Plus,
  Eye,
  X,
  FileDown,
  Bell,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PAGE_SIZE = 5;

function formatPKR(n) {
  const value = Number.isFinite(n) ? n : 0;
  return 'PKR ' + value.toLocaleString('en-PK');
}

// ---------------------------------------------------------------------------
// PDF Generators
// ---------------------------------------------------------------------------

function downloadOverdueNoticePDF(row) {
  try {
    const doc = new jsPDF();

    doc.setFillColor(225, 29, 72);
    doc.rect(0, 0, 210, 15, 'F');

    doc.setFontSize(20);
    doc.setTextColor(190, 18, 60);
    doc.text('OVERDUE PAYMENT NOTICE', 14, 30);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Notice Reference: REM-${row.ref}`, 14, 38);
    doc.text(`Issued Date: ${new Date().toLocaleDateString()}`, 14, 44);

    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(`Attention: ${row.client}`, 14, 54);
    doc.text(`Contact: ${row.clientPhone}`, 14, 60);

    const totalDue = row.amount + row.lateFee;

    const tableData = [
      ['Invoice Reference', row.ref],
      ['Property', row.property],
      ['Original Due Date', row.dueDate],
      ['Days Overdue', `${row.daysOverdue} Days`],
      ['Original Amount', formatPKR(row.amount)],
      ['Late Payment Penalty', formatPKR(row.lateFee)],
      ['Total Amount Payable', formatPKR(totalDue)],
      ['Current Notice Status', row.status],
      ['Last Reminder Logged', row.lastReminderSent],
    ];

    autoTable(doc, {
      startY: 68,
      head: [['Overdue Statement Summary', 'Details']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [225, 29, 72],
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
    });

    doc.save(
      `Overdue_Notice_${row.ref}_${row.client.replace(/\s+/g, '_')}.pdf`
    );
  } catch (error) {
    console.error('PDF generation failed:', error);
    alert(
      'Could not generate PDF. Please ensure jspdf and jspdf-autotable are installed.'
    );
  }
}

function exportAllOverduePDF(rows) {
  try {
    if (rows.length === 0) {
      alert('There are no overdue records to export.');
      return;
    }

    const doc = new jsPDF('landscape');

    doc.setFontSize(18);
    doc.setTextColor(190, 18, 60);
    doc.text('Overdue & Late Payments Report', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Total Outstanding Notices: ${rows.length} | Exported: ${new Date().toLocaleDateString()}`,
      14,
      27
    );

    const tableHead = [
      [
        'Due Date',
        'Days Overdue',
        'Ref #',
        'Property',
        'Client',
        'Amount (PKR)',
        'Late Fee (PKR)',
        'Status',
        'Last Reminder',
      ],
    ];

    const tableData = rows.map((r) => [
      r.dueDate,
      `${r.daysOverdue} days`,
      r.ref,
      r.property,
      r.client,
      r.amount.toLocaleString('en-PK'),
      r.lateFee.toLocaleString('en-PK'),
      r.status,
      r.lastReminderSent,
    ]);

    autoTable(doc, {
      startY: 33,
      head: tableHead,
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [225, 29, 72],
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 3,
      },
    });

    doc.save(`Overdue_Payments_Report_${Date.now()}.pdf`);
  } catch (error) {
    console.error('PDF Report generation failed:', error);
    alert(
      'Could not generate PDF report. Please ensure jspdf and jspdf-autotable are installed.'
    );
  }
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({ label, sub, value, icon: Icon, bg, fg }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full ${bg} ${fg}`}
      >
        <Icon size={18} />
      </span>

      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-lg font-semibold text-slate-800">{value}</p>
        <p className="text-xs text-slate-400">{sub}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter Dropdown
// ---------------------------------------------------------------------------

function FilterDropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', onClick);

    return () => {
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50"
      >
        {value}
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute left-0 z-20 mt-2 max-h-64 w-56 overflow-y-auto rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-100">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                opt === value ? 'font-medium text-rose-600' : 'text-slate-600'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// View Modal
// ---------------------------------------------------------------------------

function ViewModal({ row, onClose }) {
  const fields = [
    ['Due Date', row.dueDate],
    ['Days Overdue', `${row.daysOverdue} Days`],
    ['Invoice / Ref #', row.ref],
    ['Property', row.property],
    ['Client', row.client],
    ['Client Phone', row.clientPhone],
    ['Overdue Amount', formatPKR(row.amount)],
    ['Late Penalty Fee', formatPKR(row.lateFee)],
    ['Total Outstanding', formatPKR(row.amount + row.lateFee)],
    ['Notice Status', row.status],
    ['Last Reminder Sent', row.lastReminderSent],
  ];

  return (
    <Modal title="Overdue Notice Details" onClose={onClose}>
      <div className="flex flex-col divide-y divide-slate-100">
        {fields.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 py-2 text-sm">
            <span className="text-slate-400">{label}</span>
            <span className="text-right font-medium text-slate-700">
              {value}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={() => downloadOverdueNoticePDF(row)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700"
      >
        <FileDown size={16} />
        Download Notice PDF
      </button>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Add Overdue Record
// ---------------------------------------------------------------------------

const EMPTY_NEW_ROW = {
  dueDate: '',
  daysOverdue: 0,
  ref: '',
  property: '',
  client: '',
  clientPhone: '',
  amount: '',
  lateFee: 0,
  status: 'Overdue',
  lastReminderSent: 'Not Sent',
};

function AddOverdueModal({ onClose, onAdd }) {
  const [form, setForm] = useState(EMPTY_NEW_ROW);
  const [error, setError] = useState('');

  const setField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const submit = () => {
    if (!form.dueDate || !form.ref || !form.client || !form.amount) {
      setError(
        'Please fill in due date, reference, client, and overdue amount.'
      );
      return;
    }

    onAdd({
      ...form,
      amount: parseFloat(form.amount) || 0,
      lateFee: parseFloat(form.lateFee) || 0,
      daysOverdue: parseInt(form.daysOverdue) || 1,
      dueDate: new Date(form.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    });
  };

  const inputClass =
    'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100';

  return (
    <Modal title="Log Overdue Payment" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-slate-500">
            Due Date
            <input
              type="date"
              className={`${inputClass} mt-1`}
              value={form.dueDate}
              onChange={(e) => setField('dueDate', e.target.value)}
            />
          </label>

          <label className="text-xs text-slate-500">
            Invoice / Ref #
            <input
              className={`${inputClass} mt-1`}
              placeholder="INV-00049"
              value={form.ref}
              onChange={(e) => setField('ref', e.target.value)}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-slate-500">
            Client Name
            <input
              className={`${inputClass} mt-1`}
              placeholder="Client Name"
              value={form.client}
              onChange={(e) => setField('client', e.target.value)}
            />
          </label>

          <label className="text-xs text-slate-500">
            Phone Number
            <input
              className={`${inputClass} mt-1`}
              placeholder="+92 300..."
              value={form.clientPhone}
              onChange={(e) => setField('clientPhone', e.target.value)}
            />
          </label>
        </div>

        <label className="text-xs text-slate-500">
          Property
          <input
            className={`${inputClass} mt-1`}
            placeholder="e.g. 10 Marla House"
            value={form.property}
            onChange={(e) => setField('property', e.target.value)}
          />
        </label>

        <div className="grid grid-cols-3 gap-3">
          <label className="text-xs text-slate-500">
            Amount (PKR)
            <input
              type="number"
              className={`${inputClass} mt-1`}
              placeholder="0"
              value={form.amount}
              onChange={(e) => setField('amount', e.target.value)}
            />
          </label>

          <label className="text-xs text-slate-500">
            Late Fee (PKR)
            <input
              type="number"
              className={`${inputClass} mt-1`}
              placeholder="0"
              value={form.lateFee}
              onChange={(e) => setField('lateFee', e.target.value)}
            />
          </label>

          <label className="text-xs text-slate-500">
            Days Overdue
            <input
              type="number"
              className={`${inputClass} mt-1`}
              placeholder="1"
              value={form.daysOverdue}
              onChange={(e) => setField('daysOverdue', e.target.value)}
            />
          </label>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={submit}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            Save Record
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function OverdueReminders() {
  // No dummy/seed data
  const { payments, addPayment, updatePayment, deletePaymentById } = usePayments();

  const rows = useMemo(
    () =>
      payments
        .filter((p) => p.status === 'Overdue' || p.status === 'Severe Overdue')
        .map((p) => ({
          id: p.id,
          ref: p.ref || p.invoiceRef || p.id,
          property: p.property || '',
          client: p.client || '',
          clientPhone: p.clientPhone || p.phone || '',
          amount: Number(p.amount ?? p.amountReceived ?? 0),
          lateFee: Number(p.lateFee ?? 0),
          daysOverdue: Number(p.daysOverdue ?? 0),
          dueDate: p.dueDate || p.paymentDate || p.date || '',
          status: p.status,
          lastReminderSent: p.lastReminderSent || 'Not Sent',
        })),
    [payments]
  );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [page, setPage] = useState(1);
  const [viewRow, setViewRow] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [sentNoticeId, setSentNoticeId] = useState(null);

  const statusOptions = [
    'All Statuses',
    'Severe Overdue',
    'Overdue',
    'Grace Period',
  ];

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows.filter((r) => {
      const matchesSearch =
        !term ||
        r.ref.toLowerCase().includes(term) ||
        r.property.toLowerCase().includes(term) ||
        r.client.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === 'All Statuses' || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const pagedRows = filteredRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // -------------------------------------------------------------------------
  // Stats
  // -------------------------------------------------------------------------

  const stats = useMemo(() => {
    const totalOverdue = rows.reduce(
      (sum, r) => sum + Number(r.amount || 0),
      0
    );

    const totalPenalties = rows.reduce(
      (sum, r) => sum + Number(r.lateFee || 0),
      0
    );

    const severeCount = rows.filter(
      (r) => r.status === 'Severe Overdue'
    ).length;

    return [
      {
        label: 'Total Overdue Amount',
        sub: 'Pending Collection',
        value: formatPKR(totalOverdue),
        icon: AlertTriangle,
        bg: 'bg-rose-100',
        fg: 'text-rose-600',
      },
      {
        label: 'Late Penalty Fees',
        sub: 'Accrued Charges',
        value: formatPKR(totalPenalties),
        icon: Clock,
        bg: 'bg-amber-100',
        fg: 'text-amber-600',
      },
      {
        label: 'Severe Default Cases',
        sub: '>15 Days Overdue',
        value: String(severeCount),
        icon: UserX,
        bg: 'bg-red-100',
        fg: 'text-red-600',
      },
      {
        label: 'Reminders Sent',
        sub: 'This Month',
        value: `${
          rows.filter((r) => r.lastReminderSent !== 'Not Sent').length
        } Notices`,
        icon: Bell,
        bg: 'bg-blue-100',
        fg: 'text-blue-600',
      },
    ];
  }, [rows]);

  // -------------------------------------------------------------------------
  // Add Record
  // -------------------------------------------------------------------------

  const handleAdd = async (newRow) => {
    try {
      await addPayment({
        ...newRow,
        invoiceRef: newRow.ref,
      });
      setAddOpen(false);
    } catch (error) {
      console.error(error);
      alert('Could not save overdue record.');
    }
  };

  // -------------------------------------------------------------------------
  // Delete Record
  // -------------------------------------------------------------------------

  const handleDelete = async (id) => {
    const row = rows.find((item) => item.id === id);

    if (!row) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete overdue record "${row.ref}"?`
    );

    if (!confirmed) return;

    try {
      await deletePaymentById(id);

      if (viewRow?.id === id) {
        setViewRow(null);
      }
    } catch (error) {
      console.error(error);
      alert('Could not delete record.');
    }
  };

  // -------------------------------------------------------------------------
  // Reminder
  // -------------------------------------------------------------------------

  const markReminderSent = async (id) => {
    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    try {
      await updatePayment(id, { lastReminderSent: today });

      setSentNoticeId(id);

      setTimeout(() => {
        setSentNoticeId(null);
      }, 2000);
    } catch (error) {
      console.error(error);
      alert('Could not log reminder.');
    }
  };

  const rangeStart =
    (currentPage - 1) * PAGE_SIZE + (filteredRows.length ? 1 : 0);

  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filteredRows.length);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans">
      <main className="flex-1 overflow-y-auto px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Overdue & Reminders
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Track late payments and export overdue notices.
            </p>
          </div>

          <div className="relative w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              placeholder="Search overdue clients..."
              value={search}
              onChange={(e) => {
  setSearch(e.target.value);
  setPage(1);
}}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Filters + Actions */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
         <FilterDropdown
  options={statusOptions}
  value={statusFilter}
  onChange={(value) => {
    setStatusFilter(value);
    setPage(1);
  }}
/>

          <div className="flex items-center gap-3">
            <button
              onClick={() => exportAllOverduePDF(filteredRows)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <Download size={14} />
              Export PDF
            </button>

            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-rose-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-rose-700"
            >
              <Plus size={14} />
              Log Overdue
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="px-5 py-3 font-medium">Due Date</th>
                  <th className="px-5 py-3 font-medium">Overdue</th>
                  <th className="px-5 py-3 font-medium">Ref #</th>
                  <th className="px-5 py-3 font-medium">Property</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Amount (PKR)</th>
                  <th className="px-5 py-3 font-medium">Late Fee</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Last Reminder</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {pagedRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                          <AlertTriangle size={20} className="text-slate-400" />
                        </div>

                        <p className="text-sm font-medium text-slate-600">
                          No overdue payments found
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Log an overdue payment to see it here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedRows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <td className="px-5 py-3.5 text-slate-600">
                        {r.dueDate}
                      </td>

                      <td className="px-5 py-3.5 font-medium text-rose-600">
                        {r.daysOverdue} days
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">{r.ref}</td>

                      <td className="px-5 py-3.5 text-slate-700">
                        {r.property || '-'}
                      </td>

                      <td className="px-5 py-3.5 text-slate-700">
                        <div>{r.client}</div>
                        <div className="text-[11px] text-slate-400">
                          {r.clientPhone || '-'}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {Number(r.amount).toLocaleString('en-PK')}
                      </td>

                      <td className="px-5 py-3.5 font-medium text-amber-600">
                        {r.lateFee
                          ? Number(r.lateFee).toLocaleString('en-PK')
                          : '-'}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            r.status === 'Severe Overdue'
                              ? 'bg-rose-100 text-rose-700'
                              : r.status === 'Overdue'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {r.lastReminderSent}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* View */}
                          <button
                            onClick={() => setViewRow(r)}
                            title="View Details"
                            className="text-slate-400 transition hover:text-slate-600"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Download PDF */}
                          <button
                            onClick={() => downloadOverdueNoticePDF(r)}
                            title="Download Overdue Notice PDF"
                            className="text-slate-400 transition hover:text-rose-600"
                          >
                            <FileDown size={16} />
                          </button>

                          {/* Reminder */}
                          <button
                            onClick={() => markReminderSent(r.id)}
                            title="Log Reminder Sent"
                            className="text-slate-400 transition hover:text-blue-600"
                          >
                            {sentNoticeId === r.id ? (
                              <CheckCircle2
                                size={16}
                                className="text-emerald-600"
                              />
                            ) : (
                              <Send size={15} />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(r.id)}
                            title="Delete Record"
                            className="text-slate-400 transition hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-xs text-slate-400">
              {filteredRows.length === 0
                ? 'Showing 0 overdue records'
                : `Showing ${rangeStart} to ${rangeEnd} of ${filteredRows.length} records`}
            </p>

            {filteredRows.length > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                >
                  ‹
                </button>

                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`rounded-md px-2.5 py-1 ${
                      n === currentPage
                        ? 'bg-rose-600 text-white'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {n}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* View Modal */}
      {viewRow && <ViewModal row={viewRow} onClose={() => setViewRow(null)} />}

      {/* Add Modal */}
      {addOpen && (
        <AddOverdueModal onClose={() => setAddOpen(false)} onAdd={handleAdd} />
      )}
    </div>
  );
}
