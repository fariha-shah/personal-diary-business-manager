import { useMemo, useState } from 'react';
import { usePayments } from './hooks/usePayments';
import {
  Search,
  Download,
  Plus,
  ChevronDown,
  RotateCcw,
  Eye,
  Calendar,
  X,
  Landmark,
  Wallet,
  FileText as ChequeIcon,
  ChevronLeft,
  ChevronRight,
  User,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ---------------------------------------------------------------------------
// Local Storage
// ---------------------------------------------------------------------------

const PAGE_SIZE = 8;

const STATUS_STYLE = {
  Received: 'bg-emerald-50 text-emerald-600',
  Pending: 'bg-amber-50 text-amber-600',
  Overdue: 'bg-rose-50 text-rose-600',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


function money(value) {
  const amount = Number(value) || 0;

  return `PKR ${amount.toLocaleString('en-PK')}`;
}

function getDateValue(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function fmtDate(value) {
  const date = getDateValue(value);

  if (!date) {
    return '—';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getMethodIcon(method) {
  const value = String(method || '').toLowerCase();

  if (value.includes('bank') || value.includes('transfer')) {
    return Landmark;
  }

  if (value.includes('cash')) {
    return Wallet;
  }

  if (value.includes('cheque') || value.includes('check')) {
    return ChequeIcon;
  }

  return Wallet;
}

function getClientColor(client) {
  if (!client) {
    return 'bg-indigo-600';
  }

  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-indigo-500',
    'bg-orange-500',
    'bg-emerald-500',
    'bg-pink-500',
  ];

  let total = 0;

  for (let i = 0; i < client.length; i += 1) {
    total += client.charCodeAt(i);
  }

  return colors[total % colors.length];
}

function normalizePayment(payment) {
  return {
    ...payment,

    id: payment.id || payment.invoiceRef || '',

    property: payment.property || '',
    location: payment.location || '',

    client: payment.client || '',

    phone: payment.phone || payment.clientPhone || '',

    amount: Number(payment.amount ?? payment.amountReceived ?? 0) || 0,

    method: payment.method || payment.paymentMethod || '',

    methodSub: payment.methodSub || payment.bankAccount || '',

    status: payment.status || 'Received',

    receivedBy: payment.receivedBy || '',

    screenshot: payment.screenshot || payment.receiptFile?.data || null,

    date: payment.date || payment.paymentDate || '',

    invoiceRef: payment.invoiceRef || payment.id || '',
  };
}

// ---------------------------------------------------------------------------
// PDF Generation
// ---------------------------------------------------------------------------

function exportSinglePaymentPDF(row) {
  try {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text('Payment Receipt', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${fmtDate(new Date().toISOString())}`, 14, 28);

    const tableData = [
      ['Invoice / Ref #', row.id || 'N/A'],
      ['Date', fmtDate(row.date)],
      [
        'Property',
        `${row.property || 'N/A'}${row.location ? ` (${row.location})` : ''}`,
      ],
      ['Client Name', row.client || 'N/A'],
      ['Client Phone', row.phone || 'N/A'],
      ['Amount', money(row.amount)],
      ['Payment Method', row.method || 'N/A'],
      ['Status', row.status || 'Received'],
      ['Received By', row.receivedBy || 'N/A'],
    ];

    autoTable(doc, {
      startY: 35,
      head: [['Field', 'Details']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 27, 75],
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
    });

    if (row.screenshot) {
      const finalY = doc.lastAutoTable.finalY + 10;

      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);

      doc.text('Payment Proof / Screenshot:', 14, finalY);

      try {
        doc.addImage(row.screenshot, 'JPEG', 14, finalY + 5, 80, 80);
      } catch (imageError) {
        console.error('Could not add screenshot to PDF:', imageError);
      }
    }

    doc.save(`Receipt_${row.id || 'Payment'}.pdf`);
  } catch (error) {
    console.error('Failed to generate PDF:', error);

    alert('Could not generate PDF. Check browser console for details.');
  }
}

function exportAllPaymentsPDF(rows) {
  try {
    const doc = new jsPDF('landscape');

    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text('All Payments Report', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);

    doc.text(
      `Total Transactions: ${rows.length} | Exported: ${fmtDate(new Date())}`,
      14,
      27
    );

    const tableData = rows.map((row) => [
      fmtDate(row.date),
      row.id || 'N/A',
      row.property || 'N/A',
      row.client || 'N/A',
      Number(row.amount || 0).toLocaleString('en-PK'),
      row.method || 'N/A',
      row.status || 'Received',
      row.receivedBy || 'N/A',
    ]);

    autoTable(doc, {
      startY: 33,
      head: [
        [
          'Date',
          'Invoice',
          'Property',
          'Client',
          'Amount (PKR)',
          'Method',
          'Status',
          'Received By',
        ],
      ],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 27, 75],
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
    });

    doc.save('All_Payments_Report.pdf');
  } catch (error) {
    console.error('Failed to generate report PDF:', error);

    alert('Could not generate PDF report. Check browser console for details.');
  }
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AllPayments() {
  const {
  payments: firestorePayments,
  addPayment,
  deletePaymentById,
} = usePayments();

const payments = useMemo(
  () => firestorePayments.map(normalizePayment),
  [firestorePayments]
);

  const [search, setSearch] = useState('');

  const [propertyFilter, setPropertyFilter] = useState('All Properties');

  const [clientFilter, setClientFilter] = useState('All Clients');

  const [methodFilter, setMethodFilter] = useState('All Payment Methods');

  const [statusFilter, setStatusFilter] = useState('All Status');

  const [currentPage, setPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);

  const [viewRow, setViewRow] = useState(null);

  const [deleteRow, setDeleteRow] = useState(null);

  const [toast, setToast] = useState(null);

  

  // -------------------------------------------------------------------------
  // Toast
  // -------------------------------------------------------------------------

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast(null);
    }, 2200);
  };

  // -------------------------------------------------------------------------
  // Dynamic Filters
  // -------------------------------------------------------------------------

  const propertyOptions = useMemo(() => {
    const values = new Set();

    payments.forEach((payment) => {
      if (payment.property) {
        values.add(payment.property);
      }
    });

    return Array.from(values);
  }, [payments]);

  const clientOptions = useMemo(() => {
    const values = new Set();

    payments.forEach((payment) => {
      if (payment.client) {
        values.add(payment.client);
      }
    });

    return Array.from(values);
  }, [payments]);

  const methodOptions = useMemo(() => {
    const values = new Set();

    payments.forEach((payment) => {
      if (payment.method) {
        values.add(payment.method);
      }
    });

    return Array.from(values);
  }, [payments]);

  const statusOptions = useMemo(() => {
    const values = new Set();

    payments.forEach((payment) => {
      if (payment.status) {
        values.add(payment.status);
      }
    });

    return Array.from(values);
  }, [payments]);

  // -------------------------------------------------------------------------
  // Filtering
  // -------------------------------------------------------------------------

  const filtered = useMemo(() => {
    return payments.filter((payment) => {
      if (
        propertyFilter !== 'All Properties' &&
        payment.property !== propertyFilter
      ) {
        return false;
      }

      if (clientFilter !== 'All Clients' && payment.client !== clientFilter) {
        return false;
      }

      if (
        methodFilter !== 'All Payment Methods' &&
        payment.method !== methodFilter
      ) {
        return false;
      }

      if (statusFilter !== 'All Status' && payment.status !== statusFilter) {
        return false;
      }

      if (search.trim()) {
        const query = search.toLowerCase();

        const searchableText = [
          payment.client,
          payment.property,
          payment.id,
          payment.invoiceRef,
          payment.transactionRef,
          payment.paymentMethod,
          payment.method,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [
    payments,
    propertyFilter,
    clientFilter,
    methodFilter,
    statusFilter,
    search,
  ]);

  // -------------------------------------------------------------------------
  // Pagination
  // -------------------------------------------------------------------------

const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

const safeCurrentPage = Math.min(currentPage, totalPages);

const pageRows = filtered.slice(
  (safeCurrentPage - 1) * PAGE_SIZE,
  safeCurrentPage * PAGE_SIZE
);

  // -------------------------------------------------------------------------
  // Stats
  // -------------------------------------------------------------------------

  const stats = useMemo(() => {
    const received = payments
      .filter((payment) => payment.status === 'Received')
      .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

    const pending = payments
      .filter((payment) => payment.status === 'Pending')
      .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

    const overdue = payments
      .filter((payment) => payment.status === 'Overdue')
      .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

    return {
      received,
      pending,
      pendingCount: payments.filter((payment) => payment.status === 'Pending')
        .length,

      overdue,

      overdueCount: payments.filter((payment) => payment.status === 'Overdue')
        .length,

      clients: new Set(
        payments.map((payment) => payment.client).filter(Boolean)
      ).size,
    };
  }, [payments]);

  // -------------------------------------------------------------------------
  // Reset Filters
  // -------------------------------------------------------------------------

  function resetFilters() {
    setPropertyFilter('All Properties');

    setClientFilter('All Clients');

    setMethodFilter('All Payment Methods');

    setStatusFilter('All Status');

    setSearch('');

    setPage(1);

    showToast('Filters reset');
  }

  // -------------------------------------------------------------------------
  // Add Payment
  // -------------------------------------------------------------------------

  async function handleAddPayment(newPayment) {
  try {
    await addPayment(newPayment);

    setShowAddModal(false);
    setPage(1);

    showToast('Payment added successfully');
  } catch (error) {
    console.error(error);
    showToast('Payment could not be saved');
  }
}

  // -------------------------------------------------------------------------
  // Delete Payment
  // -------------------------------------------------------------------------
async function handleDeletePayment(payment) {
  if (!payment) return;

  try {
    await deletePaymentById(payment.id);

    if (viewRow?.id === payment.id) {
      setViewRow(null);
    }

    setDeleteRow(null);

    showToast('Payment deleted successfully');
  } catch (error) {
    console.error(error);
    showToast('Payment could not be deleted');
  }
}
  
  // -------------------------------------------------------------------------
  // Download
  // -------------------------------------------------------------------------

  function handleDownloadRow(row) {
    exportSinglePaymentPDF(row);

    showToast(`${row.id || 'Payment'} PDF downloaded`);
  }

  function handleExportAll() {
    if (!filtered.length) {
      showToast('No payments to export');

      return;
    }

    exportAllPaymentsPDF(filtered);

    showToast('Payments PDF exported');
  }

  // -------------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}

        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              All Payments
            </h1>

            <p className="mt-0.5 text-sm text-slate-500">
              View and manage your payments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportAll}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-slate-50"
            >
              <Download size={16} />
              Export PDF
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-lg bg-indigo-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-900"
            >
              <Plus size={16} />
              Add Payment
            </button>
          </div>
        </div>

        {/* Stats */}

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          <StatCard
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            icon={<Download size={16} />}
            label="Total Received"
            value={money(stats.received)}
            note="Saved payments"
            noteColor="text-slate-400"
          />

          <StatCard
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            icon={<Calendar size={16} />}
            label="Pending Amount"
            value={money(stats.pending)}
            note={`${stats.pendingCount} Payments`}
            noteColor="text-amber-600"
          />

          <StatCard
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
            icon={<X size={16} />}
            label="Overdue Amount"
            value={money(stats.overdue)}
            note={`${stats.overdueCount} Payments`}
            noteColor="text-rose-600"
          />

          <StatCard
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            icon={<Wallet size={16} />}
            label="Total Transactions"
            value={payments.length}
            note="Firestore"
            noteColor="text-slate-400"
          />

          <StatCard
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            icon={<User size={16} />}
            label="Total Clients"
            value={stats.clients}
            note="Saved payments"
            noteColor="text-slate-400"
          />
        </div>

        {/* Search & Filters */}

        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
          <div className="relative min-w-[200px] flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search invoice, client, property..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);

                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-600"
            />
          </div>

          <SelectFilter
            value={propertyFilter}
            onChange={(value) => {
              setPropertyFilter(value);

              setPage(1);
            }}
            options={['All Properties', ...propertyOptions]}
          />

          <SelectFilter
            value={clientFilter}
            onChange={(value) => {
              setClientFilter(value);

              setPage(1);
            }}
            options={['All Clients', ...clientOptions]}
          />

          <SelectFilter
            value={methodFilter}
            onChange={(value) => {
              setMethodFilter(value);

              setPage(1);
            }}
            options={['All Payment Methods', ...methodOptions]}
          />

          <SelectFilter
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);

              setPage(1);
            }}
            options={['All Status', ...statusOptions]}
          />

          <button
            onClick={resetFilters}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        {/* Table */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-400">
                  <th className="px-4 py-3 font-medium">Date</th>

                  <th className="px-4 py-3 font-medium">Invoice / Ref #</th>

                  <th className="px-4 py-3 font-medium">Property</th>

                  <th className="px-4 py-3 font-medium">Client</th>

                  <th className="px-4 py-3 font-medium">Amount (PKR)</th>

                  <th className="px-4 py-3 font-medium">Payment Method</th>

                  <th className="px-4 py-3 font-medium">Status</th>

                  <th className="px-4 py-3 font-medium">Received By</th>

                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {pageRows.map((payment) => {
                  const MethodIcon = getMethodIcon(payment.method);

                  const status = payment.status || 'Received';

                  return (
                    <tr
                      key={payment.id}
                      className="border-b border-slate-50 transition hover:bg-slate-50/60"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {fmtDate(payment.date)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">
                       {payment.invoiceRef || '—'}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-9 w-9 flex-shrink-0 rounded-lg bg-slate-100" />

                          <div>
                            <div className="whitespace-nowrap font-medium text-slate-700">
                              {payment.property || '—'}
                            </div>

                            {payment.location && (
                              <div className="whitespace-nowrap text-xs text-slate-400">
                                {payment.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${getClientColor(
                              payment.client
                            )}`}
                          >
                            {payment.client
                              ? payment.client[0].toUpperCase()
                              : 'C'}
                          </div>

                          <div>
                            <div className="whitespace-nowrap font-medium text-slate-700">
                              {payment.client || '—'}
                            </div>

                            {payment.phone && (
                              <div className="whitespace-nowrap text-xs text-slate-400">
                                {payment.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 font-medium">
                        {Number(payment.amount || 0).toLocaleString('en-PK')}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-slate-600">
                          <MethodIcon size={14} />

                          <div>
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              {payment.method || '—'}

                              {payment.screenshot && (
                                <span title="Screenshot attached">
                                  <ImageIcon
                                    size={13}
                                    className="text-indigo-600"
                                  />
                                </span>
                              )}
                            </div>

                            {payment.methodSub && (
                              <div className="whitespace-nowrap text-xs text-slate-400">
                                {payment.methodSub}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                            STATUS_STYLE[status] ||
                            'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {payment.receivedBy || '—'}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewRow(payment)}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                            title="View Details"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => handleDownloadRow(payment)}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                            title="Download PDF"
                          >
                            <Download size={15} />
                          </button>

                          <button
                            onClick={() => setDeleteRow(payment)}
                            className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
                            title="Delete Payment"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-14 text-center">
                      <div className="flex flex-col items-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                          <Wallet size={22} className="text-slate-400" />
                        </div>

                        <p className="font-medium text-slate-700">
                          No payments found
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          Add a payment and it will appear here.
                        </p>

                        <button
                          onClick={() => setShowAddModal(true)}
                          className="mt-4 flex items-center gap-2 rounded-lg bg-indigo-950 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-900"
                        >
                          <Plus size={15} />
                          Add Payment
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}

          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
            <div>
              Showing {filtered.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1}
to {Math.min(safeCurrentPage * PAGE_SIZE, filtered.length)} payments
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={safeCurrentPage === 1}
                className="rounded-md border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) => index + 1
              )
                .filter(
                  (number) =>
                    number === 1 ||
                    number === totalPages ||
                    Math.abs(number - safeCurrentPage) <= 1
                )
                .reduce((result, number, index, array) => {
                  if (index > 0 && number - array[index - 1] > 1) {
                    result.push('...');
                  }

                  result.push(number);

                  return result;
                }, [])
                .map((number, index) =>
                  number === '...' ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-slate-300"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={number}
                      onClick={() => setPage(number)}
                      className={`h-7 w-7 rounded-md text-xs font-medium ${
                        number === safeCurrentPage
                          ? 'bg-indigo-950 text-white'
                          : 'border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {number}
                    </button>
                  )
                )}

              <button
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={safeCurrentPage === totalPages}
                className="rounded-md border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Modal */}

      {showAddModal && (
        <AddPaymentModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddPayment}
        />
      )}

      {/* View Modal */}

      {viewRow && (
        <ViewModal
          row={viewRow}
          onClose={() => setViewRow(null)}
          onDownload={handleDownloadRow}
          onDelete={(row) => {
            setViewRow(null);
            setDeleteRow(row);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}

      {deleteRow && (
        <DeleteConfirmModal
          payment={deleteRow}
          onCancel={() => setDeleteRow(null)}
          onConfirm={() => handleDeletePayment(deleteRow)}
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

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({ iconBg, iconColor, icon, label, value, note, noteColor }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div
        className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}
      >
        {icon}
      </div>

      <div className="text-xs text-slate-400">{label}</div>

      <div className="mt-0.5 truncate text-lg font-semibold text-slate-900">
        {value}
      </div>

      <div className={`mt-1 text-xs ${noteColor}`}>{note}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Select Filter
// ---------------------------------------------------------------------------

function SelectFilter({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm outline-none hover:bg-slate-50"
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

// ---------------------------------------------------------------------------
// Add Payment Modal
// ---------------------------------------------------------------------------

function AddPaymentModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    property: '',
    client: '',
    clientPhone: '',
    amount: '',
    method: '',
    status: 'Received',
    date: new Date().toISOString().split('T')[0],
    screenshot: null,
  });

  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.');

      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setForm((previous) => ({
        ...previous,
        screenshot: reader.result,
      }));

      setError('');
    };

    reader.readAsDataURL(file);
  };

  async function submit()  {
    if (!form.property.trim()) {
      setError('Please enter a property name.');

      return;
    }

    if (!form.client.trim()) {
      setError('Please enter a client name.');

      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError('Please enter a valid amount.');

      return;
    }

    if (!form.method.trim()) {
      setError('Please enter a payment method.');

      return;
    }

    const paymentId = `PAY-${Date.now()}`;
  
    const payment = {
      id: paymentId,

      invoiceRef: paymentId,

      date: form.date,

      paymentDate: form.date,

      property: form.property.trim(),

      client: form.client.trim(),

      phone: form.clientPhone.trim(),

      amount: Number(form.amount),

      amountReceived: Number(form.amount),

      method: form.method.trim(),

      paymentMethod: form.method.trim(),

      status: form.status || 'Received',

      screenshot: form.screenshot,

      createdAt: new Date().toISOString(),
    };

    await onSave(payment);

    
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Add Payment</h2>

          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}

        <div className="space-y-4 overflow-y-auto p-5">
          <Field label="Property Name">
            <input
              type="text"
              className="input"
              placeholder="Enter property name..."
              value={form.property}
              onChange={(event) => {
                setForm({
                  ...form,
                  property: event.target.value,
                });

                setError('');
              }}
            />
          </Field>

          <Field label="Client Name">
            <input
              type="text"
              className="input"
              placeholder="Enter client name..."
              value={form.client}
              onChange={(event) => {
                setForm({
                  ...form,
                  client: event.target.value,
                });

                setError('');
              }}
            />
          </Field>

          <Field label="Client Phone Number (Optional)">
            <input
              type="text"
              className="input"
              placeholder="e.g. 0300-1234567"
              value={form.clientPhone}
              onChange={(event) =>
                setForm({
                  ...form,
                  clientPhone: event.target.value,
                })
              }
            />
          </Field>

          <Field label="Amount (PKR)">
            <input
              type="number"
              min="0"
              className="input"
              placeholder="Enter amount..."
              value={form.amount}
              onChange={(event) => {
                setForm({
                  ...form,
                  amount: event.target.value,
                });

                setError('');
              }}
            />
          </Field>

          <Field label="Payment Method">
            <input
              type="text"
              className="input"
              placeholder="e.g. Bank Transfer, Cash, Cheque"
              value={form.method}
              onChange={(event) => {
                setForm({
                  ...form,
                  method: event.target.value,
                });

                setError('');
              }}
            />
          </Field>

          <Field label="Status">
            <select
              className="input"
              value={form.status}
              onChange={(event) =>
                setForm({
                  ...form,
                  status: event.target.value,
                })
              }
            >
              <option value="Received">Received</option>

              <option value="Pending">Pending</option>

              <option value="Overdue">Overdue</option>
            </select>
          </Field>

          <Field label="Date">
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={(event) =>
                setForm({
                  ...form,
                  date: event.target.value,
                })
              }
            />
          </Field>

          <Field label="Payment Method Screenshot (Optional)">
            <div className="relative mt-1 flex cursor-pointer justify-center rounded-lg border-2 border-dashed border-slate-200 px-4 pb-4 pt-4 transition hover:border-indigo-400">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />

              <div className="space-y-1 text-center">
                {form.screenshot ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={form.screenshot}
                      alt="Screenshot Preview"
                      className="mb-1 h-20 w-auto rounded object-cover"
                    />

                    <span className="text-xs font-medium text-indigo-600">
                      Click to replace screenshot
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="mx-auto flex h-7 w-7 items-center justify-center text-slate-400">
                      <ImageIcon size={24} />
                    </div>

                    <div className="flex text-xs text-slate-600">
                      <span className="font-medium text-indigo-600">
                        Upload screenshot
                      </span>

                      <p className="pl-1">or drag file</p>
                    </div>

                    <p className="text-[10px] text-slate-400">
                      PNG, JPG up to 5MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </Field>

          {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>

        {/* Footer */}

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="rounded-lg bg-indigo-950 px-4 py-2 text-sm text-white hover:bg-indigo-900"
          >
            Save Payment
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
          border-color: #4338ca;
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Field
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// View Modal
// ---------------------------------------------------------------------------

function ViewModal({ row, onClose, onDownload, onDelete }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Payment Details</h2>

          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Details */}

        <div className="space-y-3 overflow-y-auto p-5 text-sm">
          <Row label="Invoice" value={row.id} />

          <Row label="Date" value={fmtDate(row.date)} />

          <Row
            label="Property"
            value={
              row.property
                ? `${row.property}${row.location ? ` — ${row.location}` : ''}`
                : '—'
            }
          />

          <Row
            label="Client"
            value={
              row.client
                ? `${row.client}${row.phone ? ` (${row.phone})` : ''}`
                : '—'
            }
          />

          <Row label="Amount" value={money(row.amount)} />

          <Row label="Method" value={row.method || '—'} />

          <Row label="Status">
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                STATUS_STYLE[row.status] || 'bg-slate-100 text-slate-600'
              }`}
            >
              {row.status || 'Received'}
            </span>
          </Row>

          <Row label="Received By" value={row.receivedBy || '—'} />

          {row.screenshot && (
            <div className="border-t border-slate-100 pt-2">
              <span className="mb-2 block text-xs font-medium text-slate-400">
                Payment Proof Screenshot
              </span>

              <img
                src={row.screenshot}
                alt="Payment Screenshot"
                className="max-h-48 w-full rounded-lg border border-slate-200 bg-slate-50 object-contain p-1"
              />
            </div>
          )}
        </div>

        {/* Footer */}

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            onClick={() => onDelete(row)}
            className="flex items-center gap-2 rounded-lg border border-rose-200 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
          >
            <Trash2 size={14} />
            Delete
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
            className="rounded-lg bg-indigo-950 px-4 py-2 text-sm text-white hover:bg-indigo-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete Confirmation Modal
// ---------------------------------------------------------------------------

function DeleteConfirmModal({ payment, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertTriangle size={24} />
          </div>

          <h2 className="text-lg font-semibold text-slate-900">
            Delete Payment?
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Are you sure you want to delete this payment? This action cannot be
            undone.
          </p>

          <div className="mt-4 w-full rounded-lg bg-slate-50 px-4 py-3 text-left">
            <div className="text-xs text-slate-400">Payment</div>

            <div className="mt-1 font-medium text-slate-700">
              {payment.id || 'Payment'}
            </div>

            <div className="mt-1 text-sm text-slate-500">
              {payment.client || 'No client'} • {money(payment.amount)}
            </div>
          </div>

          <div className="mt-6 flex w-full gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700"
            >
              Delete Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------

function Row({ label, value, children }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-50 py-1 last:border-0">
      <span className="text-slate-400">{label}</span>

      {children ? (
        children
      ) : (
        <span className="text-right font-medium text-slate-700">{value}</span>
      )}
    </div>
  );
}
