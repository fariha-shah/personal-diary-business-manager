import { useMemo, useState } from 'react';
import { usePayments } from './hooks/usePayments';
import {
  Search,
  Eye,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Building2,
  Pencil,
  Undo2,
  Trash2,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PAGE_SIZE = 5;

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function statusOf(row) {
  if (row.received) return 'Received';
  if (row.dueIn < 0) return 'Overdue';
  if (row.dueIn <= 7) return 'Due Soon';

  return 'Upcoming';
}

const STATUS_STYLE = {
  'Due Soon': {
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    bar: 'bg-amber-400',
  },

  Upcoming: {
    badge: 'bg-blue-50 text-blue-700 ring-blue-200',
    bar: 'bg-blue-400',
  },

  Overdue: {
    badge: 'bg-rose-50 text-rose-700 ring-rose-200',
    bar: 'bg-rose-400',
  },

  Received: {
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    bar: 'bg-emerald-400',
  },
};

function formatPKR(amount) {
  return `PKR ${Number(amount).toLocaleString('en-PK')}`;
}

function formatDueIn(dueIn) {
  if (dueIn < 0) {
    return `${Math.abs(dueIn)} days overdue`;
  }

  if (dueIn === 0) {
    return 'Due today';
  }

  return `${dueIn} days`;
}

function formatDate(iso) {
  if (!iso) return '-';

  const date = new Date(`${iso}T00:00:00`);

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function PendingPayments() {
  const { payments, updatePayment, deletePaymentById } = usePayments();

  // Reshape shared payments into this page's row format.
  // "Due date" isn't a separate concept elsewhere in the app, so we
  // reuse paymentDate/date as the due date, and derive dueIn from it.
  const rows = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return payments.map((p) => {
      const dueDateStr = p.dueDate || p.paymentDate || p.date || '';
      let dueIn = 0;

      if (dueDateStr) {
        const due = new Date(`${dueDateStr}T00:00:00`);
        if (!isNaN(due.getTime())) {
          dueIn = Math.round((due - today) / (1000 * 60 * 60 * 24));
        }
      }

      return {
        id: p.id,
        property: p.property || '',
        client: p.client || '',
        amount: Number(p.amount ?? p.amountReceived ?? 0),
        dueDate: dueDateStr,
        dueIn,
        received: p.status === 'Received',
        receivedAt: p.receivedAt || null,
      };
    });
  }, [payments]);

  const [search, setSearch] = useState('');

  const [propertyFilter, setPropertyFilter] = useState('All Properties');

  const [clientFilter, setClientFilter] = useState('All Clients');

  const [statusFilters, setStatusFilters] = useState([]);

  const [showFilters, setShowFilters] = useState(false);

  const [showReceived, setShowReceived] = useState(false);

  const [sortBy, setSortBy] = useState({
    key: 'dueIn',
    dir: 'asc',
  });

  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState(null);

  const [editing, setEditing] = useState(null);

  const [toast, setToast] = useState(null);

  const [undo, setUndo] = useState(null);

  // --------------------------------------------------
  // Properties
  // --------------------------------------------------

  const properties = useMemo(() => {
    return [
      'All Properties',
      ...Array.from(new Set(rows.map((row) => row.property).filter(Boolean))),
    ];
  }, [rows]);

  // --------------------------------------------------
  // Clients
  // --------------------------------------------------

  const clients = useMemo(() => {
    return [
      'All Clients',
      ...Array.from(new Set(rows.map((row) => row.client).filter(Boolean))),
    ];
  }, [rows]);

  // --------------------------------------------------
  // Filtered Rows
  // --------------------------------------------------

  const filtered = useMemo(() => {
    let result = rows
      .filter((row) => showReceived || !row.received)
      .map((row) => ({
        ...row,
        status: statusOf(row),
      }));

    // Search
    if (search.trim()) {
      const query = search.trim().toLowerCase();

      result = result.filter(
        (row) =>
          row.property?.toLowerCase().includes(query) ||
          row.client?.toLowerCase().includes(query) ||
          row.id?.toLowerCase().includes(query)
      );
    }

    // Property filter
    if (propertyFilter !== 'All Properties') {
      result = result.filter((row) => row.property === propertyFilter);
    }

    // Client filter
    if (clientFilter !== 'All Clients') {
      result = result.filter((row) => row.client === clientFilter);
    }

    // Status filter
    if (statusFilters.length > 0) {
      result = result.filter((row) => statusFilters.includes(row.status));
    }

    // Sorting
    result.sort((a, b) => {
      const direction = sortBy.dir === 'asc' ? 1 : -1;

      if (sortBy.key === 'amount') {
        return (Number(a.amount) - Number(b.amount)) * direction;
      }

      return (Number(a.dueIn) - Number(b.dueIn)) * direction;
    });

    return result;
  }, [
    rows,
    search,
    propertyFilter,
    clientFilter,
    statusFilters,
    sortBy,
    showReceived,
  ]);

  // --------------------------------------------------
  // Summary
  // --------------------------------------------------

  const pendingRows = rows.filter((row) => !row.received);

  const totalPending = pendingRows.reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );

  const pendingInvoices = pendingRows.length;

  const dueWithin7 = pendingRows
    .filter((row) => Number(row.dueIn) >= 0 && Number(row.dueIn) <= 7)
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);

  const overdueTotal = pendingRows
    .filter((row) => Number(row.dueIn) < 0)
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const pageSafe = Math.min(page, totalPages);

  const pageRows = filtered.slice(
    (pageSafe - 1) * PAGE_SIZE,
    pageSafe * PAGE_SIZE
  );

  // --------------------------------------------------
  // Toast
  // --------------------------------------------------

  function showToast(message) {
    setToast(message);

    setTimeout(() => {
      setToast(null);
    }, 2200);
  }

  // --------------------------------------------------
  // Status Filter
  // --------------------------------------------------

  function toggleStatus(status) {
    setStatusFilters((previous) => {
      if (previous.includes(status)) {
        return previous.filter((item) => item !== status);
      }

      return [...previous, status];
    });

    setPage(1);
  }

  // --------------------------------------------------
  // Sorting
  // --------------------------------------------------

  function toggleSort(key) {
    setSortBy((previous) => {
      if (previous.key === key) {
        return {
          key,
          dir: previous.dir === 'asc' ? 'desc' : 'asc',
        };
      }

      return {
        key,
        dir: 'asc',
      };
    });
  }

  // --------------------------------------------------
  // Mark Received
  // --------------------------------------------------

  async function markReceived(id) {
    const receivedAt = new Date().toISOString();

    try {
      await updatePayment(id, { status: 'Received', receivedAt });
    } catch (error) {
      console.error(error);
      showToast('Could not update payment.');
      return;
    }

    setSelected(null);

    if (undo?.timeoutId) {
      clearTimeout(undo.timeoutId);
    }

    const timeoutId = setTimeout(() => {
      setUndo(null);
    }, 6000);

    setUndo({
      id,
      timeoutId,
    });
  }
  // --------------------------------------------------
  // Undo Received
  // --------------------------------------------------
async function undoReceived() {
    if (!undo) return;

    clearTimeout(undo.timeoutId);

    try {
      // Firestore rejects `undefined` — use null instead to clear the field
      await updatePayment(undo.id, { status: 'Pending', receivedAt: null });
    } catch (error) {
      console.error(error);
      showToast('Could not undo.');
    }

    setUndo(null);
  }
  
  // --------------------------------------------------
  // Delete Payment
  // --------------------------------------------------

  async function deletePayment(id) {
    const payment = rows.find((row) => row.id === id);

    if (!payment) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${payment.id}?`
    );

    if (!confirmed) return;

    try {
      await deletePaymentById(id);
    } catch (error) {
      console.error(error);
      showToast('Could not delete payment.');
      return;
    }

    setSelected(null);

    if (editing?.id === id) {
      setEditing(null);
    }

    setPage(1);

    showToast(`Payment ${payment.id} deleted`);
  }


  // --------------------------------------------------
  // Save Edit
  // --------------------------------------------------

  async function saveEdit(updated) {
    try {
      await updatePayment(updated.id, {
        property: updated.property,
        client: updated.client,
        amount: updated.amount,
        dueDate: updated.dueDate,
      });

      setEditing(null);
      showToast('Payment details updated');
    } catch (error) {
      console.error(error);
      showToast('Could not save changes.');
    }
  }

  // --------------------------------------------------
  // Export Full PDF
  // --------------------------------------------------

  function exportPDF() {
    try {
      if (filtered.length === 0) {
        showToast('No payments available to export');
        return;
      }

      const doc = new jsPDF('landscape');

      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);

      doc.text('Pending Payments Report', 14, 18);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);

      doc.text(
        `Generated on: ${new Date().toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}`,
        14,
        26
      );

      doc.text(`Showing ${filtered.length} of ${rows.length} invoices`, 14, 32);

      let infoY = 39;

      if (statusFilters.length > 0) {
        doc.text(`Status: ${statusFilters.join(', ')}`, 14, infoY);

        infoY += 6;
      }

      if (propertyFilter !== 'All Properties') {
        doc.text(`Property: ${propertyFilter}`, 14, infoY);

        infoY += 6;
      }

      if (clientFilter !== 'All Clients') {
        doc.text(`Client: ${clientFilter}`, 14, infoY);

        infoY += 6;
      }

      const tableData = filtered.map((row) => [
        formatDate(row.dueDate),
        row.id,
        row.property,
        row.client,
        Number(row.amount || 0).toLocaleString('en-PK'),
        formatDueIn(row.dueIn),
        row.status,
      ]);

      autoTable(doc, {
        startY: infoY + 6,

        head: [
          [
            'Due Date',
            'Invoice / Ref #',
            'Property',
            'Client',
            'Amount (PKR)',
            'Due In',
            'Status',
          ],
        ],

        body: tableData,

        theme: 'striped',

        headStyles: {
          fillColor: [13, 148, 136],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },

        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },

        styles: {
          fontSize: 8,
          cellPadding: 3,
          textColor: [51, 65, 85],
        },

        columnStyles: {
          0: {
            cellWidth: 28,
          },

          1: {
            cellWidth: 30,
          },

          2: {
            cellWidth: 45,
          },

          3: {
            cellWidth: 42,
          },

          4: {
            cellWidth: 38,
            halign: 'right',
          },

          5: {
            cellWidth: 32,
          },

          6: {
            cellWidth: 28,
          },
        },
      });

      const finalY = doc.lastAutoTable?.finalY || 80;

      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);

      doc.text(`Total Pending: ${formatPKR(totalPending)}`, 14, finalY + 12);

      doc.text(`Pending Invoices: ${pendingInvoices}`, 14, finalY + 18);

      doc.text(`Due Within 7 Days: ${formatPKR(dueWithin7)}`, 14, finalY + 24);

      doc.text(`Overdue: ${formatPKR(overdueTotal)}`, 14, finalY + 30);

      // eslint-disable-next-line react-hooks/purity -- exportPDF only ever runs from a button onClick, never during render
doc.save(`Pending_Payments_Report_${Date.now()}.pdf`);

      showToast('Pending payments PDF downloaded');
    } catch (error) {
      console.error('PDF Export failed:', error);

      showToast('Failed to generate PDF');
    }
  }

  // --------------------------------------------------
  // Export Single Payment PDF
  // --------------------------------------------------

  function exportRowPDF(row) {
    try {
      const doc = new jsPDF();

      const status = statusOf(row);

      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);

      doc.text('Payment Invoice', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);

      doc.text(
        `Generated on: ${new Date().toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}`,
        14,
        28
      );

      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);

      doc.text(`Invoice / Ref #: ${row.id}`, 14, 40);

      autoTable(doc, {
        startY: 48,

        head: [['Payment Detail', 'Information']],

        body: [
          ['Client', row.client],
          ['Property', row.property],
          ['Amount Due', formatPKR(row.amount)],
          ['Due Date', formatDate(row.dueDate)],
          ['Due In', formatDueIn(row.dueIn)],
          ['Status', status],
        ],

        theme: 'striped',

        headStyles: {
          fillColor: [13, 148, 136],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },

        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },

        styles: {
          fontSize: 10,
          cellPadding: 5,
          textColor: [51, 65, 85],
        },

        columnStyles: {
          0: {
            cellWidth: 55,
            fontStyle: 'bold',
          },

          1: {
            cellWidth: 110,
          },
        },
      });

      const finalY = doc.lastAutoTable?.finalY || 100;

      doc.setDrawColor(226, 232, 240);

      doc.line(14, finalY + 12, 196, finalY + 12);

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);

      doc.text(
        'This is a system-generated summary of a pending payment.',
        14,
        finalY + 22
      );

      if (row.received && row.receivedAt) {
        doc.text(
          `Received on: ${new Date(row.receivedAt).toLocaleDateString('en-US', {
            dateStyle: 'medium',
          })}`,
          14,
          finalY + 29
        );
      } else {
        doc.text(
          'This document is not a receipt of payment received.',
          14,
          finalY + 29
        );
      }

      const safeClientName =
        row.client?.replace(/[^a-zA-Z0-9]/g, '_') || 'Client';

      doc.save(`${row.id}_${safeClientName}.pdf`);

      showToast(`PDF downloaded for ${row.client}`);
    } catch (error) {
      console.error('PDF Export failed:', error);

      showToast('Failed to generate PDF');
    }
  }

  // --------------------------------------------------
  // JSX
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Search Bar */}

      <div className="border-b border-slate-200 bg-white px-6 py-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search properties, clients..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>
      </div>

      {/* Main Content */}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Heading */}

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pending Payments
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Payments that are due but not received yet.
          </p>
        </div>

        {/* Summary Cards */}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={<FileText className="h-5 w-5" />}
            iconBg="bg-rose-50 text-rose-500"
            label="Total Pending"
            value={formatPKR(totalPending)}
            sub="All properties"
          />

          <SummaryCard
            icon={<FileText className="h-5 w-5" />}
            iconBg="bg-amber-50 text-amber-500"
            label="Pending Invoices"
            value={String(pendingInvoices)}
            sub="All properties"
          />

          <SummaryCard
            icon={<Clock className="h-5 w-5" />}
            iconBg="bg-blue-50 text-blue-500"
            label="Due Within 7 Days"
            value={formatPKR(dueWithin7)}
            sub="Next 7 days"
          />

          <SummaryCard
            icon={<AlertTriangle className="h-5 w-5" />}
            iconBg="bg-rose-50 text-rose-500"
            label="Overdue"
            value={formatPKR(overdueTotal)}
            sub="Past due date"
          />
        </div>

        {/* Filter Bar */}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Dropdown
              value={propertyFilter}
              options={properties}
              onChange={(value) => {
                setPropertyFilter(value);
                setPage(1);
              }}
            />

            <Dropdown
              value={clientFilter}
              options={clients}
              onChange={(value) => {
                setClientFilter(value);
                setPage(1);
              }}
            />

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={showReceived}
                onChange={(event) => {
                  setShowReceived(event.target.checked);
                  setPage(1);
                }}
                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              />
              Show received
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters((previous) => !previous)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                showFilters || statusFilters.length
                  ? 'border-teal-600 bg-teal-50 text-teal-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {statusFilters.length > 0 && (
                <span className="rounded-full bg-teal-600 px-1.5 text-xs font-semibold text-white">
                  {statusFilters.length}
                </span>
              )}
            </button>

            <button
              onClick={exportPDF}
              className="flex items-center gap-2 rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-teal-800"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Status Filters */}

        {showFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
            <span className="mr-1 text-sm font-medium text-slate-500">
              Status:
            </span>

            {['Due Soon', 'Upcoming', 'Overdue', 'Received'].map((status) => (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${
                  statusFilters.includes(status)
                    ? `${STATUS_STYLE[status].badge} ring-2`
                    : 'bg-white text-slate-500 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}

            {statusFilters.length > 0 && (
              <button
                onClick={() => {
                  setStatusFilters([]);
                  setPage(1);
                }}
                className="ml-2 text-xs font-medium text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Table */}

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <Th
                    label="Due Date"
                    active={sortBy.key === 'dueIn'}
                    dir={sortBy.dir}
                    onClick={() => toggleSort('dueIn')}
                  />

                  <th className="px-4 py-3 font-medium">Invoice / Ref #</th>

                  <th className="px-4 py-3 font-medium">Property</th>

                  <th className="px-4 py-3 font-medium">Client</th>

                  <Th
                    label="Amount (PKR)"
                    active={sortBy.key === 'amount'}
                    dir={sortBy.dir}
                    onClick={() => toggleSort('amount')}
                    right
                  />

                  <th className="px-4 py-3 font-medium">Due In</th>

                  <th className="px-4 py-3 font-medium">Status</th>

                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {pageRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
                  >
                    {/* Due Date */}

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-6 w-1 rounded-full ${STATUS_STYLE[row.status].bar}`}
                        />

                        {formatDate(row.dueDate)}
                      </div>
                    </td>

                    {/* Invoice */}

                    <td className="px-4 py-3 font-medium text-slate-700">
                      {row.id}
                    </td>

                    {/* Property */}

                    <td className="px-4 py-3 text-slate-600">{row.property}</td>

                    {/* Client */}

                    <td className="px-4 py-3 text-slate-600">{row.client}</td>

                    {/* Amount */}

                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                      {Number(row.amount || 0).toLocaleString('en-PK')}
                    </td>

                    {/* Due In */}

                    <td className="px-4 py-3 text-slate-500">
                      {formatDueIn(Number(row.dueIn || 0))}
                    </td>

                    {/* Status */}

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_STYLE[row.status].badge}`}
                      >
                        {row.status}
                      </span>
                    </td>

                    {/* Actions */}

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View */}

                        <button
                          onClick={() => setSelected(row)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-teal-700"
                          aria-label={`View ${row.id}`}
                          title="View payment"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Edit */}

                        <button
                          onClick={() => setEditing(row)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-teal-700"
                          aria-label={`Edit ${row.id}`}
                          title="Edit payment"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        {/* PDF */}

                        <button
                          onClick={() => exportRowPDF(row)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-teal-700"
                          aria-label={`Download PDF for ${row.client}`}
                          title="Download invoice"
                        >
                          <Download className="h-4 w-4" />
                        </button>

                        {/* Delete */}

                        <button
                          onClick={() => deletePayment(row.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          aria-label={`Delete ${row.id}`}
                          title="Delete payment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty State */}

                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                          <FileText className="h-6 w-6 text-slate-400" />
                        </div>

                        <h3 className="mt-3 text-sm font-semibold text-slate-700">
                          No pending payments
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          {rows.length === 0
                            ? 'There are no payment records available yet.'
                            : 'No payments match your current filters.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}

          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing{' '}
              {filtered.length === 0 ? 0 : (pageSafe - 1) * PAGE_SIZE + 1} to{' '}
              {Math.min(pageSafe * PAGE_SIZE, filtered.length)} of{' '}
              {filtered.length} pending payments
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                disabled={pageSafe === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => setPage(number)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${
                      number === pageSafe
                        ? 'bg-teal-700 text-white'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {number}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setPage((previous) => Math.min(totalPages, previous + 1))
                }
                disabled={pageSafe === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}

      {selected && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-teal-700" />

                <h2 className="text-lg font-semibold text-slate-900">
                  {selected.property}
                </h2>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <Row label="Invoice / Ref #" value={selected.id} />

              <Row label="Client" value={selected.client} />

              <Row label="Amount" value={formatPKR(selected.amount)} />

              <Row label="Due Date" value={formatDate(selected.dueDate)} />

              {!selected.received && (
                <Row label="Due In" value={formatDueIn(selected.dueIn)} />
              )}

              {selected.received && selected.receivedAt && (
                <Row
                  label="Received On"
                  value={new Date(selected.receivedAt).toLocaleDateString(
                    'en-US',
                    {
                      dateStyle: 'medium',
                    }
                  )}
                />
              )}

              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Status</span>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_STYLE[statusOf(selected)].badge}`}
                >
                  {statusOf(selected)}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              {/* Edit */}

              <button
                onClick={() => {
                  setEditing(selected);
                  setSelected(null);
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>

              {/* PDF */}

              <button
                onClick={() => exportRowPDF(selected)}
                className="flex items-center justify-center gap-2 rounded-lg border border-teal-600 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>

              {/* Delete */}

              <button
                onClick={() => deletePayment(selected.id)}
                className="col-span-2 flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100"
              >
                <Trash2 className="h-4 w-4" />
                Delete Payment
              </button>

              {/* Received */}

              {selected.received ? (
                <button
                  onClick={() => setSelected(null)}
                  className="col-span-2 rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-500"
                  disabled
                >
                  Already received
                </button>
              ) : (
                <button
                  onClick={() => markReceived(selected.id)}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-lg bg-teal-700 py-2 text-sm font-medium text-white hover:bg-teal-800"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Received
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}

      {editing && (
        <EditModal
          row={editing}
          onCancel={() => setEditing(null)}
          onSave={saveEdit}
        />
      )}

      {/* Undo Toast */}

      {undo && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
          Payment marked as received
          <button
            onClick={undoReceived}
            className="flex items-center gap-1 font-semibold text-teal-300 hover:text-teal-200"
          >
            <Undo2 className="h-4 w-4" />
            Undo
          </button>
        </div>
      )}

      {/* Normal Toast */}

      {toast && !undo && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------
// Edit Modal
// --------------------------------------------------

function EditModal({ row, onCancel, onSave }) {
  const [property, setProperty] = useState(row.property || '');

  const [client, setClient] = useState(row.client || '');

  const [amount, setAmount] = useState(row.amount ?? '');

  const [dueDate, setDueDate] = useState(row.dueDate || '');

  const [dueIn, setDueIn] = useState(row.dueIn ?? 0);

  function handleSave() {
    if (
      !property.trim() ||
      !client.trim() ||
      !dueDate ||
      amount === '' ||
      isNaN(Number(amount))
    ) {
      return;
    }

    onSave({
      id: row.id,
      property: property.trim(),
      client: client.trim(),
      amount: Number(amount),
      dueDate,
      dueIn: Number(dueIn),
    });
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Edit Payment · {row.id}
          </h2>

          <button
            onClick={onCancel}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <Field label="Property">
            <input
              value={property}
              onChange={(event) => setProperty(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </Field>

          <Field label="Client">
            <input
              value={client}
              onChange={(event) => setClient(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </Field>

          <Field label="Amount (PKR)">
            <input
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Due Date">
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </Field>

            <Field label="Due In (days)">
              <input
                type="number"
                value={dueIn}
                onChange={(event) => setDueIn(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </Field>
          </div>

          <p className="text-xs text-slate-400">
            Negative "Due In" values mark a payment as overdue.
          </p>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="flex-1 rounded-lg bg-teal-700 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------
// Field
// --------------------------------------------------

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

// --------------------------------------------------
// Summary Card
// --------------------------------------------------

function SummaryCard({ icon, iconBg, label, value, sub }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
      >
        {icon}
      </div>

      <div>
        <div className="text-xs font-medium text-slate-400">{label}</div>

        <div className="mt-0.5 text-lg font-bold text-slate-900">{value}</div>

        <div className="text-xs text-slate-400">{sub}</div>
      </div>
    </div>
  );
}

// --------------------------------------------------
// Dropdown
// --------------------------------------------------

function Dropdown({ value, options, onChange }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-teal-500"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

// --------------------------------------------------
// Table Header
// --------------------------------------------------

function Th({ label, active, dir, onClick, right }) {
  return (
    <th
      onClick={onClick}
      className={`cursor-pointer select-none px-4 py-3 font-medium hover:text-teal-700 ${
        right ? 'text-right' : ''
      }`}
    >
      <span className="inline-flex items-center gap-1">
        {label}

        {active && (
          <span className="text-teal-600">{dir === 'asc' ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  );
}

// --------------------------------------------------
// Detail Row
// --------------------------------------------------

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>

      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
