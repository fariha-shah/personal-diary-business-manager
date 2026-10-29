import { useMemo, useState } from 'react';
import { useLoan } from '../PersonalExpenses/hooks/useLoan';
import {
  Search,
  ChevronDown,
  FileText,
  Wallet,
  Trash2,
  Landmark,
  Users,
  Plus,
  Eye,
  Download,
  X,
  CheckCircle2,
  RotateCcw,
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


const PAGE_SIZE = 6;

function fmt(n) {
  return Number(n || 0).toLocaleString('en-PK');
}

function fmtDate(iso) {
  if (!iso) return '-';

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}


// ---------- PDF Export ----------

function exportSingleLoanPDF(row) {
  const doc = new jsPDF();
  const remaining = Number(row.amount || 0) - Number(row.received || 0);

  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text(`Loan Report: ${row.id}`, 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 26);

  const tableData = [
    ['Loan ID', row.id],
    ['Property', row.property || '-'],
    ['Client', row.client || '-'],
    ['Bank / Lender', row.bank || '-'],
    ['Loan Type', row.type || '-'],
    ['Loan Amount', `PKR ${fmt(row.amount)}`],
    ['Received', `PKR ${fmt(row.received)}`],
    ['Remaining', `PKR ${fmt(remaining)}`],
    ['Start Date', fmtDate(row.start)],
    ['End Date', fmtDate(row.end)],
    ['Status', row.status || '-'],
  ];

  autoTable(doc, {
    startY: 32,
    head: [['Field', 'Details']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
  });

  doc.save(`${row.id}.pdf`);
}

function exportAllLoansPDF(rows) {
  const doc = new jsPDF('landscape');

  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text('Loan Details Report', 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString()} | Total Records: ${rows.length}`,
    14,
    24
  );

  const headers = [
    [
      'ID',
      'Property',
      'Client',
      'Bank',
      'Type',
      'Amount (PKR)',
      'Received (PKR)',
      'Remaining (PKR)',
      'Start Date',
      'End Date',
      'Status',
    ],
  ];

  const bodyData = rows.map((r) => [
    r.id,
    r.property || '-',
    r.client || '-',
    r.bank || '-',
    r.type || '-',
    fmt(r.amount),
    fmt(r.received),
    fmt(Number(r.amount || 0) - Number(r.received || 0)),
    fmtDate(r.start),
    fmtDate(r.end),
    r.status || '-',
  ]);

  autoTable(doc, {
    startY: 30,
    head: headers,
    body: bodyData,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  doc.save('loans-report.pdf');
}

// ---------- UI Components ----------

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

function Dropdown({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3.5 pr-8 text-sm text-slate-600 outline-none hover:bg-slate-50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function TypeBadge({ type = '' }) {
  const normalizedType = type.toLowerCase();

  const isGiven =
    normalizedType.includes('given') || normalizedType.includes('lent');

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        isGiven ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
      }`}
    >
      {isGiven ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}

      {type || '-'}
    </span>
  );
}

function StatusBadge({ status }) {
  return status === 'Active' ? (
    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-600">
      Active
    </span>
  ) : (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
      Returned
    </span>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">
        {label}
      </span>

      {children}
    </label>
  );
}

// ---------- Add Loan Modal ----------

function AddLoanModal({
  onClose,
  onSave,
  existingProperties,
  existingClients,
  existingBanks,
}) {
  const [form, setForm] = useState({
    property: '',
    client: '',
    bank: '',
    amount: '',
    received: '',
    start: '',
    end: '',
    type: '',
  });

  const [error, setError] = useState('');

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError('');
  }

  function submit() {
    if (!form.property.trim() || !form.client.trim() || !form.bank.trim()) {
      setError('Please fill in property, client, and bank details.');
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError('Please enter a valid loan amount.');
      return;
    }

    if (form.received && Number(form.received) > Number(form.amount)) {
      setError('Received amount cannot exceed loan amount.');
      return;
    }

    if (!form.start || !form.end) {
      setError('Please select start and end dates.');
      return;
    }

    if (!form.type.trim()) {
      setError('Please enter loan type.');
      return;
    }

    const loan = {
      property: form.property.trim(),
      client: form.client.trim(),
      bank: form.bank.trim(),
      amount: Number(form.amount),
      received: Number(form.received || 0),
      start: form.start,
      end: form.end,
      type: form.type.trim(),
      status: 'Active',
    };

    onSave(loan);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Add Loan</h2>

          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Property">
              <input
                type="text"
                className="input"
                list="property-list"
                placeholder="Type property..."
                value={form.property}
                onChange={(e) => updateField('property', e.target.value)}
              />

              <datalist id="property-list">
                {existingProperties.map((property) => (
                  <option key={property} value={property} />
                ))}
              </datalist>
            </Field>

            <Field label="Client">
              <input
                type="text"
                className="input"
                list="client-list"
                placeholder="Type client..."
                value={form.client}
                onChange={(e) => updateField('client', e.target.value)}
              />

              <datalist id="client-list">
                {existingClients.map((client) => (
                  <option key={client} value={client} />
                ))}
              </datalist>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Bank / Lender">
              <input
                type="text"
                className="input"
                list="bank-list"
                placeholder="Type bank/lender..."
                value={form.bank}
                onChange={(e) => updateField('bank', e.target.value)}
              />

              <datalist id="bank-list">
                {existingBanks.map((bank) => (
                  <option key={bank} value={bank} />
                ))}
              </datalist>
            </Field>

            <Field label="Loan Type">
              <input
                type="text"
                className="input"
                placeholder="e.g. Given, Taken..."
                value={form.type}
                onChange={(e) => updateField('type', e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Loan Amount (PKR)">
              <input
                type="number"
                min="0"
                className="input"
                placeholder="Enter amount"
                value={form.amount}
                onChange={(e) => updateField('amount', e.target.value)}
              />
            </Field>

            <Field label="Received (PKR)">
              <input
                type="number"
                min="0"
                className="input"
                placeholder="Enter received amount"
                value={form.received}
                onChange={(e) => updateField('received', e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date">
              <input
                type="date"
                className="input"
                value={form.start}
                onChange={(e) => updateField('start', e.target.value)}
              />
            </Field>

            <Field label="End Date">
              <input
                type="date"
                className="input"
                value={form.end}
                onChange={(e) => updateField('end', e.target.value)}
              />
            </Field>
          </div>

          {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Save Loan
          </button>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          font-size: 0.875rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          outline: none;
        }

        .input:focus {
          border-color: #2563eb;
        }
      `}</style>
    </div>
  );
}

// ---------- View Modal ----------

function ViewModal({ row, onClose, onDownload, onToggleReturned }) {
  const remaining = Number(row.amount || 0) - Number(row.received || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Loan Details</h2>

          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 p-5 text-sm">
          <Row label="Loan ID" value={row.id} />
          <Row label="Property" value={row.property} />
          <Row label="Client" value={row.client} />
          <Row label="Bank / Lender" value={row.bank} />

          <Row label="Loan Type">
            <TypeBadge type={row.type} />
          </Row>

          <Row label="Loan Amount" value={`PKR ${fmt(row.amount)}`} />

          <Row label="Received" value={`PKR ${fmt(row.received)}`} />

          <Row label="Remaining" value={`PKR ${fmt(remaining)}`} />

          <Row label="Start Date" value={fmtDate(row.start)} />

          <Row label="End Date" value={fmtDate(row.end)} />

          <Row label="Status">
            <StatusBadge status={row.status} />
          </Row>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
          <button
            onClick={() => onToggleReturned(row)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
          >
            {row.status === 'Active' ? (
              <>
                <CheckCircle2 size={14} />
                Mark as Returned
              </>
            ) : (
              <>
                <RotateCcw size={14} />
                Reopen Loan
              </>
            )}
          </button>

          <button
            onClick={() => onDownload(row)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
          >
            <Download size={14} />
            Download PDF
          </button>

          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, children }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-50 py-1.5 last:border-0">
      <span className="text-slate-400">{label}</span>

      {children ? (
        children
      ) : (
        <span className="font-medium text-slate-700">{value || '-'}</span>
      )}
    </div>
  );
}

// ---------- Main Component ----------

export default function LoanDetail() {
  const { loanRecords: rows, addLoan, updateLoan, deleteLoan } = useLoan();
  const [search, setSearch] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('All Properties');
  const [clientFilter, setClientFilter] = useState('All Clients');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [toast, setToast] = useState(null);

  // ---------- Dynamic suggestions from saved data only ----------

  const dynamicProperties = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.property).filter(Boolean)));
  }, [rows]);

  const dynamicClients = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.client).filter(Boolean)));
  }, [rows]);

  const dynamicBanks = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.bank).filter(Boolean)));
  }, [rows]);

  // ---------- Toast ----------

  function showToast(message) {
    setToast(message);

    setTimeout(() => {
      setToast(null);
    }, 2000);
  }

  // ---------- Filtering ----------

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (
        propertyFilter !== 'All Properties' &&
        row.property !== propertyFilter
      ) {
        return false;
      }

      if (clientFilter !== 'All Clients' && row.client !== clientFilter) {
        return false;
      }

      if (search.trim()) {
        const query = search.toLowerCase();

        const matches =
          row.id?.toLowerCase().includes(query) ||
          row.property?.toLowerCase().includes(query) ||
          row.client?.toLowerCase().includes(query) ||
          row.bank?.toLowerCase().includes(query);

        if (!matches) {
          return false;
        }
      }

      return true;
    });
  }, [rows, propertyFilter, clientFilter, search]);

  // ---------- Pagination ----------

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ---------- Statistics ----------

  const stats = useMemo(() => {
    const totalAmount = rows.reduce(
      (sum, row) => sum + Number(row.amount || 0),
      0
    );

    const totalReceived = rows.reduce(
      (sum, row) => sum + Number(row.received || 0),
      0
    );

    const totalRemaining = totalAmount - totalReceived;

    const activeCount = rows.filter((row) => row.status === 'Active').length;

    return {
      totalAmount,
      totalReceived,
      totalRemaining,
      activeCount,
    };
  }, [rows]);

  // ---------- Add Loan ----------

 function handleAddLoan(loan) {
    addLoan(loan);

    setShowAdd(false);
    setPage(1);

    showToast('Loan added successfully');
  }

  // ---------- Download ----------

  function handleDownload(row) {
    exportSingleLoanPDF(row);
    showToast(`${row.id} downloaded as PDF`);
  }

  function handleExportAll() {
    if (filtered.length === 0) {
      showToast('No loans available to export');
      return;
    }

    exportAllLoansPDF(filtered);
    showToast('Loans exported as PDF');
  }

  // ---------- Toggle Returned ----------

  function handleToggleReturned(row) {
    if (row.status === 'Active') {
      updateLoan(row.id, { status: 'Returned', received: row.amount });
    } else {
      updateLoan(row.id, { status: 'Active' });
    }

    setViewRow((previousRow) => {
      if (!previousRow || previousRow.id !== row.id) {
        return previousRow;
      }

      if (previousRow.status === 'Active') {
        return {
          ...previousRow,
          status: 'Returned',
          received: previousRow.amount,
        };
      }

      return {
        ...previousRow,
        status: 'Active',
      };
    });

    showToast(
      row.status === 'Active'
        ? `${row.id} marked as returned`
        : `${row.id} reopened`
    );
  }
  function handleDeleteLoan(row) {
    const confirmed = window.confirm(
      `Are you sure you want to delete loan ${row.id}?`
    );

    if (!confirmed) {
      return;
    }

   deleteLoan(row.id);

    if (viewRow?.id === row.id) {
      setViewRow(null);
    }

    setPage(1);
    showToast(`${row.id} deleted successfully`);
  }
  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans">
      <main className="flex-1 overflow-y-auto px-8 py-6">
        {/* Header */}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Loan Detail
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              View all loans taken by clients for properties.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Search loan, client or property..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <button
              onClick={handleExportAll}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Download size={16} />
              Export PDF
            </button>

            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus size={16} />
              Add Loan
            </button>
          </div>
        </div>

        {/* Stats */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Loan Amount"
            sub="Saved Loans"
            value={`PKR ${fmt(stats.totalAmount)}`}
            icon={FileText}
            bg="bg-blue-100"
            fg="text-blue-600"
          />

          <StatCard
            label="Total Received"
            sub="Saved Loans"
            value={`PKR ${fmt(stats.totalReceived)}`}
            icon={Wallet}
            bg="bg-emerald-100"
            fg="text-emerald-600"
          />

          <StatCard
            label="Total Remaining"
            sub="Saved Loans"
            value={`PKR ${fmt(stats.totalRemaining)}`}
            icon={Landmark}
            bg="bg-amber-100"
            fg="text-amber-600"
          />

          <StatCard
            label="Active Loans"
            sub="Saved Loans"
            value={stats.activeCount}
            icon={Users}
            bg="bg-purple-100"
            fg="text-purple-600"
          />
        </div>

        {/* Filters */}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Dropdown
              value={propertyFilter}
              onChange={(value) => {
                setPropertyFilter(value);
                setPage(1);
              }}
              options={['All Properties', ...dynamicProperties]}
            />

            <Dropdown
              value={clientFilter}
              onChange={(value) => {
                setClientFilter(value);
                setPage(1);
              }}
              options={['All Clients', ...dynamicClients]}
            />
          </div>
        </div>

        {/* Table */}

        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="px-5 py-3 font-medium">Loan ID</th>
                <th className="px-5 py-3 font-medium">Property</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Bank / Lender</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Loan Amount (PKR)</th>
                <th className="px-5 py-3 font-medium">Received (PKR)</th>
                <th className="px-5 py-3 font-medium">Remaining (PKR)</th>
                <th className="px-5 py-3 font-medium">Start Date</th>
                <th className="px-5 py-3 font-medium">End Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {pageRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                >
                  <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-700">
                    {row.id}
                  </td>

                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-700">
                    {row.property}
                  </td>

                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-700">
                    {row.client}
                  </td>

                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                    {row.bank}
                  </td>

                  <td className="px-5 py-3.5">
                    <TypeBadge type={row.type} />
                  </td>

                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-700">
                    {fmt(row.amount)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-700">
                    {fmt(row.received)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-700">
                    {fmt(Number(row.amount || 0) - Number(row.received || 0))}
                  </td>

                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                    {fmtDate(row.start)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                    {fmtDate(row.end)}
                  </td>

                  <td className="px-5 py-3.5">
                    <StatusBadge status={row.status} />
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {/* View */}
                      <button
                        onClick={() => setViewRow(row)}
                        className="text-slate-400 hover:text-slate-600"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Download PDF */}
                      <button
                        onClick={() => handleDownload(row)}
                        className="text-slate-400 hover:text-slate-600"
                        title="Download PDF"
                      >
                        <Download size={15} />
                      </button>

                      {/* Returned / Reopen */}
                      <button
                        onClick={() => handleToggleReturned(row)}
                        className="text-slate-400 hover:text-slate-600"
                        title={
                          row.status === 'Active'
                            ? 'Mark as Returned'
                            : 'Reopen'
                        }
                      >
                        {row.status === 'Active' ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <RotateCcw size={15} />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteLoan(row)}
                        className="text-slate-400 hover:text-red-600"
                        title="Delete Loan"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {pageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={12}
                    className="px-5 py-10 text-center text-sm text-slate-400"
                  >
                    No saved loans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}

          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-xs text-slate-400">
              Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}{' '}
              to {Math.min(page * PAGE_SIZE, filtered.length)} of{' '}
              {filtered.length} loans
            </p>

            <div className="flex items-center gap-1 text-sm">
              <button
                onClick={() =>
                  setPage((currentPage) => Math.max(1, currentPage - 1))
                }
                disabled={page === 1}
                className="rounded-md px-2 py-1 text-slate-400 disabled:opacity-30 hover:bg-slate-50"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => setPage(number)}
                    className={`rounded-md px-2.5 py-1 ${
                      number === page
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {number}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setPage((currentPage) =>
                    Math.min(totalPages, currentPage + 1)
                  )
                }
                disabled={page === totalPages}
                className="rounded-md px-2 py-1 text-slate-400 disabled:opacity-30 hover:bg-slate-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Add Loan */}

      {showAdd && (
        <AddLoanModal
          onClose={() => setShowAdd(false)}
          onSave={handleAddLoan}
          existingProperties={dynamicProperties}
          existingClients={dynamicClients}
          existingBanks={dynamicBanks}
        />
      )}

      {/* View Loan */}

      {viewRow && (
        <ViewModal
          row={viewRow}
          onClose={() => setViewRow(null)}
          onDownload={handleDownload}
          onToggleReturned={handleToggleReturned}
        />
      )}

      {/* Toast */}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
