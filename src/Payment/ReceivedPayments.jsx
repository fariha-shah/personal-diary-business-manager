import { useMemo, useRef, useState, useEffect } from 'react';
import { usePayments } from './hooks/usePayments';
import {
  Search,
  ChevronDown,
  Wallet,
  Repeat,
  BarChart2,
  Users,
  Download,
  Plus,
  Eye,
  X,
  Calendar,
  FileDown,
  Upload,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 5;

const PAYMENT_METHODS = [
  'Bank Transfer',
  'Cash',
  'Cheque',
  'Credit Card',
  'Mobile Wallet',
];



// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPKR(n) {
  const value = Number.isFinite(Number(n)) ? Number(n) : 0;
  return 'PKR ' + value.toLocaleString('en-PK');
}

function toDate(str) {
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

// ---------------------------------------------------------------------------
// PDF - Single Receipt
// ---------------------------------------------------------------------------

function downloadSingleReceiptPDF(row) {
  try {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text('Payment Receipt', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Reference: ${row.ref}`, 14, 28);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 34);

    const tableData = [
      ['Date', row.date],
      ['Invoice / Ref #', row.ref],
      ['Property', row.property || '—'],
      ['Client', row.client],
      ['Amount', formatPKR(row.amount)],
      ['Payment Method', row.method],
      ['Received By', row.receivedBy || '—'],
    ];

    autoTable(doc, {
      startY: 42,
      head: [['Field', 'Details']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [37, 99, 235],
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
    });

    if (row.screenshot) {
      const finalY = doc.lastAutoTable.finalY + 10;

      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('Payment Proof / Screenshot:', 14, finalY);

      const format = row.screenshot.includes('png') ? 'PNG' : 'JPEG';

      doc.addImage(row.screenshot, format, 14, finalY + 5, 80, 80);
    }

    doc.save(`Receipt_${row.ref || 'Payment'}.pdf`);
  } catch (error) {
    console.error('PDF generation failed:', error);
    alert(
      'Could not generate PDF. Please ensure jspdf and jspdf-autotable are installed.'
    );
  }
}

// ---------------------------------------------------------------------------
// PDF - All Payments
// ---------------------------------------------------------------------------

function exportAllPaymentsPDF(rows) {
  if (!rows.length) {
    alert('There are no payments available to export.');
    return;
  }

  try {
    const doc = new jsPDF('landscape');

    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text('Received Payments Report', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Total Records: ${rows.length} | Exported: ${new Date().toLocaleDateString()}`,
      14,
      27
    );

    const tableHead = [
      [
        'Date',
        'Invoice #',
        'Property',
        'Client',
        'Amount (PKR)',
        'Method',
        'Received By',
      ],
    ];

    const tableData = rows.map((r) => [
      r.date,
      r.ref,
      r.property || '—',
      r.client,
      Number(r.amount).toLocaleString('en-PK'),
      r.method,
      r.receivedBy || '—',
    ]);

    autoTable(doc, {
      startY: 33,
      head: tableHead,
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
      },
      styles: {
        fontSize: 9,
        cellPadding: 3.5,
      },
    });

    doc.save(`Received_Payments_${Date.now()}.pdf`);
  } catch (error) {
    console.error('PDF Report generation failed:', error);
    alert(
      'Could not generate report PDF. Please ensure jspdf and jspdf-autotable are installed.'
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
    function handleOutsideClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50"
      >
        {value}
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute left-0 z-20 mt-2 max-h-64 w-56 overflow-y-auto rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-100">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                option === value
                  ? 'font-medium text-blue-600'
                  : 'text-slate-600'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Date Range
// ---------------------------------------------------------------------------

function DateRangeButton({ range, onApply }) {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(range.start);
  const [end, setEnd] = useState(range.end);
  const ref = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const label =
    range.start && range.end
      ? `${new Date(range.start).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })} – ${new Date(range.end).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`
      : 'All Dates';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50"
      >
        <Calendar size={14} />
        {label}
      </button>

      {open && (
        <div className="absolute left-0 z-20 mt-2 w-64 rounded-xl bg-white p-4 shadow-lg ring-1 ring-slate-100">
          <div className="flex flex-col gap-3">
            <label className="text-xs text-slate-500">
              From
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-blue-400"
              />
            </label>

            <label className="text-xs text-slate-500">
              To
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-blue-400"
              />
            </label>

            <div className="flex justify-between gap-2 pt-1">
              <button
                onClick={() => {
                  setStart('');
                  setEnd('');
                  onApply({
                    start: '',
                    end: '',
                  });
                  setOpen(false);
                }}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
              >
                Clear
              </button>

              <button
                onClick={() => {
                  onApply({
                    start,
                    end,
                  });
                  setOpen(false);
                }}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
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
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 px-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// View Payment Modal
// ---------------------------------------------------------------------------

function ViewModal({ row, onClose, onDelete }) {
  const fields = [
    ['Date', row.date],
    ['Invoice / Ref #', row.ref],
    ['Property', row.property || '—'],
    ['Client', row.client],
    ['Amount', formatPKR(row.amount)],
    ['Payment Method', row.method],
    ['Received By', row.receivedBy || '—'],
  ];

  return (
    <Modal title="Payment Details" onClose={onClose}>
      <div className="flex flex-col divide-y divide-slate-100">
        {fields.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between gap-4 py-2.5 text-sm"
          >
            <span className="text-slate-400">{label}</span>

            <span className="text-right font-medium text-slate-700">
              {value}
            </span>
          </div>
        ))}
      </div>

      {row.screenshot && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <span className="mb-2 block text-xs font-medium text-slate-400">
            Attached Proof Screenshot
          </span>

          <img
            src={row.screenshot}
            alt="Payment Screenshot"
            className="max-h-48 w-full rounded-lg border border-slate-200 bg-slate-50 object-contain p-1"
          />
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => downloadSingleReceiptPDF(row)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <FileDown size={16} />
          Download PDF
        </button>

        <button
          onClick={() => onDelete(row)}
          className="flex items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Delete Confirmation Modal
// ---------------------------------------------------------------------------

function DeleteConfirmModal({ row, onClose, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Trash2 size={18} />
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Delete Payment
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Are you sure you want to delete payment{' '}
              <span className="font-semibold text-slate-700">{row?.ref}</span>?
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Trash2 size={15} />
            Delete Payment
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Payment Modal
// ---------------------------------------------------------------------------

const EMPTY_NEW_ROW = {
  date: '',
  ref: '',
  property: '',
  client: '',
  amount: '',
  method: 'Bank Transfer',
  receivedBy: '',
  screenshot: null,
};

function AddPaymentModal({ onClose, onAdd }) {
  const [form, setForm] = useState(EMPTY_NEW_ROW);
  const [error, setError] = useState('');

  const setField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setField('screenshot', reader.result);
      setError('');
    };

    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!form.date || !form.ref.trim() || !form.client.trim() || !form.amount) {
      setError('Please fill in date, reference, client, and amount.');
      return;
    }

    if (Number(form.amount) <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    const formattedPayment = {
      ...form,
      ref: form.ref.trim(),
      property: form.property.trim(),
      client: form.client.trim(),
      receivedBy: form.receivedBy.trim(),
      amount: parseFloat(form.amount) || 0,
      date: new Date(form.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    onAdd(formattedPayment);
  };

  const inputClass =
    'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100';

  return (
    <Modal title="Add Payment" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-slate-500">
            Date
            <input
              type="date"
              className={`${inputClass} mt-1`}
              value={form.date}
              onChange={(e) => setField('date', e.target.value)}
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

        <label className="text-xs text-slate-500">
          Property
          <input
            className={`${inputClass} mt-1`}
            placeholder="e.g. 5 Marla House"
            value={form.property}
            onChange={(e) => setField('property', e.target.value)}
          />
        </label>

        <label className="text-xs text-slate-500">
          Client
          <input
            className={`${inputClass} mt-1`}
            placeholder="Client name"
            value={form.client}
            onChange={(e) => setField('client', e.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-slate-500">
            Amount (PKR)
            <input
              type="number"
              min="0"
              className={`${inputClass} mt-1`}
              placeholder="0"
              value={form.amount}
              onChange={(e) => setField('amount', e.target.value)}
            />
          </label>

          <label className="text-xs text-slate-500">
            Payment Method
            <select
              className={`${inputClass} mt-1`}
              value={form.method}
              onChange={(e) => setField('method', e.target.value)}
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="text-xs text-slate-500">
          Received By
          <input
            className={`${inputClass} mt-1`}
            placeholder="Person who received the payment"
            value={form.receivedBy}
            onChange={(e) => setField('receivedBy', e.target.value)}
          />
        </label>

        {/* Screenshot */}
        <div className="mt-1">
          <span className="mb-1 block text-xs text-slate-500">
            Payment Screenshot / Receipt Proof
          </span>

          <div className="relative cursor-pointer rounded-xl border-2 border-dashed border-slate-200 p-4 text-center transition hover:border-blue-400">
            <input
              type="file"
              accept="image/*"
              onChange={handleScreenshotChange}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />

            {form.screenshot ? (
              <div className="flex flex-col items-center">
                <img
                  src={form.screenshot}
                  alt="Payment proof preview"
                  className="mb-1 h-20 rounded object-cover"
                />

                <span className="text-xs font-medium text-blue-600">
                  Click to replace image
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload size={20} className="mb-1 text-slate-400" />

                <span className="text-xs font-medium text-slate-600">
                  Upload screenshot image
                </span>

                <span className="text-[10px] text-slate-400">
                  PNG, JPG or WEBP
                </span>
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save Payment
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ReceivedPayments() {
  // Empty initially — no dummy data
  const { payments, addPayment, deletePaymentById } = usePayments();

// Pull only Received payments out of the shared payments collection,
// and reshape them into the field names this page's UI already expects.
const rows = useMemo(
  () =>
    payments
      .filter((p) => (p.status || 'Received') === 'Received')
      .map((p) => ({
        id: p.id,
        ref: p.ref || p.invoiceRef || p.id,
        property: p.property || '',
        client: p.client || '',
        amount: Number(p.amount ?? p.amountReceived ?? 0),
        date: p.date || p.paymentDate || '',
        method: p.method || p.paymentMethod || '',
        receivedBy: p.receivedBy || '',
        screenshot: p.screenshot || null,
      })),
  [payments]
);

  const [search, setSearch] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('All Properties');
  const [clientFilter, setClientFilter] = useState('All Clients');

  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  const [page, setPage] = useState(1);

  const [viewRow, setViewRow] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState(null);

  // -------------------------------------------------------------------------
  // Filter Options
  // -------------------------------------------------------------------------

  const propertyOptions = useMemo(
    () => [
      'All Properties',
      ...Array.from(new Set(rows.map((r) => r.property).filter(Boolean))),
    ],
    [rows]
  );

  const clientOptions = useMemo(
    () => [
      'All Clients',
      ...Array.from(new Set(rows.map((r) => r.client).filter(Boolean))),
    ],
    [rows]
  );

  // -------------------------------------------------------------------------
  // Filtering
  // -------------------------------------------------------------------------

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    const start = dateRange.start
      ? new Date(`${dateRange.start}T00:00:00`)
      : null;

    const end = dateRange.end ? new Date(`${dateRange.end}T23:59:59`) : null;

    return rows.filter((row) => {
      const matchesSearch =
        !term ||
        row.ref.toLowerCase().includes(term) ||
        (row.property || '').toLowerCase().includes(term) ||
        row.client.toLowerCase().includes(term);

      const matchesProperty =
        propertyFilter === 'All Properties' || row.property === propertyFilter;

      const matchesClient =
        clientFilter === 'All Clients' || row.client === clientFilter;

      const rowDate = toDate(row.date);

      const matchesStart = !start || (rowDate && rowDate >= start);

      const matchesEnd = !end || (rowDate && rowDate <= end);

      return (
        matchesSearch &&
        matchesProperty &&
        matchesClient &&
        matchesStart &&
        matchesEnd
      );
    });
  }, [rows, search, propertyFilter, clientFilter, dateRange]);

  // -------------------------------------------------------------------------
  // Pagination
  // -------------------------------------------------------------------------

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const pagedRows = filteredRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // -------------------------------------------------------------------------
  // Statistics
  // -------------------------------------------------------------------------

  const stats = useMemo(() => {
    const total = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

    const count = rows.length;

    const average = count ? total / count : 0;

    const clients = new Set(rows.map((row) => row.client).filter(Boolean)).size;

    return [
      {
        label: 'Total Received',
        sub: 'All Payments',
        value: formatPKR(total),
        icon: Wallet,
        bg: 'bg-emerald-100',
        fg: 'text-emerald-600',
      },
      {
        label: 'Transactions',
        sub: 'All Payments',
        value: String(count),
        icon: Repeat,
        bg: 'bg-blue-100',
        fg: 'text-blue-600',
      },
      {
        label: 'Average Payment',
        sub: 'All Payments',
        value: formatPKR(Math.round(average)),
        icon: BarChart2,
        bg: 'bg-purple-100',
        fg: 'text-purple-600',
      },
      {
        label: 'Total Clients',
        sub: 'All Clients',
        value: String(clients),
        icon: Users,
        bg: 'bg-amber-100',
        fg: 'text-amber-600',
      },
    ];
  }, [rows]);

  // -------------------------------------------------------------------------
  // Add Payment
  // -------------------------------------------------------------------------

  const handleAdd = async (newRow) => {
  try {
    await addPayment({
      ...newRow,
      invoiceRef: newRow.ref, // keeps this consistent with AllPayments' field naming
      status: 'Received',
    });
    setAddOpen(false);
    setPage(1);
  } catch (error) {
    console.error(error);
    alert('Payment could not be saved.');
  }
};

  // -------------------------------------------------------------------------
  // Delete Payment
  // -------------------------------------------------------------------------

  const handleDelete = async () => {
  if (!deleteRow) return;

  try {
    await deletePaymentById(deleteRow.id);

    if (viewRow?.id === deleteRow.id) {
      setViewRow(null);
    }

    setDeleteRow(null);
    setPage(1);
  } catch (error) {
    console.error(error);
    alert('Payment could not be deleted.');
  }
};

  // -------------------------------------------------------------------------
  // Pagination helpers
  // -------------------------------------------------------------------------

  const rangeStart =
    filteredRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filteredRows.length);

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="flex h-full w-full flex-col bg-slate-50 font-sans">
      <main className="flex-1 overflow-y-auto px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Received Payments
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              View and manage all payments you have received.
            </p>
          </div>

          <div className="relative w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Search properties, clients..."
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
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Filters / Actions */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <DateRangeButton
  range={dateRange}
  onApply={(range) => {
    setDateRange(range);
    setPage(1);
  }}
/>

           <FilterDropdown
  options={propertyOptions}
  value={propertyFilter}
  onChange={(value) => {
    setPropertyFilter(value);
    setPage(1);
  }}
/>

<FilterDropdown
  options={clientOptions}
  value={clientFilter}
  onChange={(value) => {
    setClientFilter(value);
    setPage(1);
  }}
/>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => exportAllPaymentsPDF(filteredRows)}
              disabled={!filteredRows.length}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={14} />
              Export PDF
            </button>

            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus size={14} />
              Add Payment
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="px-5 py-3 font-medium">Date</th>

                  <th className="px-5 py-3 font-medium">Invoice / Ref #</th>

                  <th className="px-5 py-3 font-medium">Property</th>

                  <th className="px-5 py-3 font-medium">Client</th>

                  <th className="px-5 py-3 font-medium">Amount (PKR)</th>

                  <th className="px-5 py-3 font-medium">Payment Method</th>

                  <th className="px-5 py-3 font-medium">Received By</th>

                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {pagedRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                          <Wallet size={22} className="text-slate-400" />
                        </div>

                        <p className="text-sm font-medium text-slate-600">
                          {rows.length === 0
                            ? 'No received payments yet'
                            : 'No payments match your filters'}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {rows.length === 0
                            ? 'Click Add Payment to record your first payment.'
                            : 'Try changing your search or filters.'}
                        </p>

                        {rows.length === 0 && (
                          <button
                            onClick={() => setAddOpen(true)}
                            className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                          >
                            <Plus size={15} />
                            Add Payment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="px-5 py-3.5 text-slate-600">{row.date}</td>

                      <td className="px-5 py-3.5 font-medium text-slate-600">
                        {row.ref}
                      </td>

                      <td className="px-5 py-3.5 text-slate-700">
                        {row.property || '—'}
                      </td>

                      <td className="px-5 py-3.5 text-slate-700">
                        {row.client}
                      </td>

                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {Number(row.amount).toLocaleString('en-PK')}
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          {row.method}

                          {row.screenshot && (
                            <span title="Screenshot Attached">
                              <ImageIcon size={14} className="text-blue-600" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">
                        {row.receivedBy || '—'}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* View */}
                          <button
                            onClick={() => setViewRow(row)}
                            title="View details"
                            className="text-slate-400 hover:text-slate-700"
                          >
                            <Eye size={16} />
                          </button>

                          {/* PDF */}
                          <button
                            onClick={() => downloadSingleReceiptPDF(row)}
                            title={`Download ${row.client}'s payment as PDF`}
                            className="text-slate-400 hover:text-blue-600"
                          >
                            <FileDown size={16} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteRow(row)}
                            title="Delete payment"
                            className="text-slate-400 hover:text-red-600"
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
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <p className="text-xs text-slate-400">
              {filteredRows.length === 0
                ? 'Showing 0 payments'
                : `Showing ${rangeStart} to ${rangeEnd} of ${filteredRows.length} payments`}
            </p>

            <div className="flex items-center gap-1 text-sm">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
              >
                ‹
              </button>

              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => setPage(number)}
                  className={`rounded-md px-2.5 py-1 ${
                    number === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {number}
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
          </div>
        </div>
      </main>

      {/* View Modal */}
      {viewRow && (
        <ViewModal
          row={viewRow}
          onClose={() => setViewRow(null)}
          onDelete={(row) => {
            setViewRow(null);
            setDeleteRow(row);
          }}
        />
      )}

      {/* Add Payment */}
      {addOpen && (
        <AddPaymentModal onClose={() => setAddOpen(false)} onAdd={handleAdd} />
      )}

      {/* Delete Confirmation */}
      {deleteRow && (
        <DeleteConfirmModal
          row={deleteRow}
          onClose={() => setDeleteRow(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
