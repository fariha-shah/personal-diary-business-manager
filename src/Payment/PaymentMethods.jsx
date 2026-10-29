import { useMemo, useState } from 'react';
import { usePaymentMethods } from './hooks/usePaymentMethods';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Landmark,
  Banknote,
  CreditCard as CardIcon,
  Smartphone,
  X,
  FileDown,
  ImagePlus,
  Eye,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Payment method options
// ---------------------------------------------------------------------------

const TYPE_OPTIONS = ['Bank', 'Cash', 'Cheque', 'Mobile Wallet', 'Credit Card'];

const ONLINE_TYPES = ['Bank', 'Mobile Wallet', 'Credit Card'];

const TYPE_ICONS = {
  Bank: {
    icon: Landmark,
    bg: 'bg-emerald-100',
    fg: 'text-emerald-600',
  },
  Cash: {
    icon: Banknote,
    bg: 'bg-blue-100',
    fg: 'text-blue-600',
  },
  Cheque: {
    icon: CardIcon,
    bg: 'bg-indigo-100',
    fg: 'text-indigo-600',
  },
  'Mobile Wallet': {
    icon: Smartphone,
    bg: 'bg-rose-100',
    fg: 'text-rose-600',
  },
  'Credit Card': {
    icon: CardIcon,
    bg: 'bg-purple-100',
    fg: 'text-purple-600',
  },
};

const statusStyles = {
  Active: 'bg-emerald-100 text-emerald-600',
  Inactive: 'bg-slate-100 text-slate-500',
};

// ---------------------------------------------------------------------------
// Empty form
// ---------------------------------------------------------------------------

const EMPTY_FORM = {
  name: '',
  type: 'Bank',
  account: '',
  sub: '',
  status: 'Active',
  clientName: '',
  screenshot: null,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function downloadMethodSummary(method) {
  const win = window.open('', '_blank', 'width=800,height=1000');

  if (!win) {
    alert('Please allow pop-ups to download the PDF.');
    return;
  }

  const badgeColor = method.status === 'Active' ? '#059669' : '#64748b';

  const badgeBg = method.status === 'Active' ? '#ecfdf5' : '#f1f5f9';

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(method.name)} - Payment Method</title>

<style>
  * {
    box-sizing: border-box;
  }

  body {
    font-family: Arial, sans-serif;
    color: #1e293b;
    padding: 48px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #2563eb;
    padding-bottom: 20px;
    margin-bottom: 28px;
  }

  .header h1 {
    font-size: 20px;
    margin: 0;
    color: #0f172a;
  }

  .header p {
    margin: 4px 0 0;
    font-size: 12px;
    color: #94a3b8;
  }

  .badge {
    background: ${badgeBg};
    color: ${badgeColor};
    font-size: 12px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 999px;
  }

  .row {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    padding: 10px 0;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
  }

  .row span:first-child {
    color: #94a3b8;
  }

  .row span:last-child {
    font-weight: 600;
    color: #1e293b;
    text-align: right;
  }

  .screenshot {
    margin-top: 24px;
  }

  .screenshot p {
    font-size: 11px;
    color: #94a3b8;
    margin-bottom: 6px;
  }

  .screenshot img {
    max-width: 100%;
    max-height: 500px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  .footer {
    margin-top: 40px;
    font-size: 11px;
    color: #94a3b8;
    text-align: center;
  }

  @media print {
    body {
      padding: 24px;
    }
  }
</style>
</head>

<body>

  <div class="header">
    <div>
      <h1>Payment Method Summary</h1>
      <p>${escapeHtml(method.name)}</p>
    </div>

    <span class="badge">
      ${escapeHtml(method.status)}
    </span>
  </div>

  <div class="row">
    <span>Method Name</span>
    <span>${escapeHtml(method.name)}</span>
  </div>

  <div class="row">
    <span>Client</span>
    <span>${escapeHtml(method.clientName || '—')}</span>
  </div>

  <div class="row">
    <span>Type</span>
    <span>${escapeHtml(method.type)}</span>
  </div>

  <div class="row">
    <span>Account / Details</span>
    <span>${escapeHtml(method.account)}</span>
  </div>

  ${
    method.sub
      ? `
        <div class="row">
          <span>Note</span>
          <span>${escapeHtml(method.sub)}</span>
        </div>
      `
      : ''
  }

  <div class="row">
    <span>Status</span>
    <span>${escapeHtml(method.status)}</span>
  </div>

  ${
    method.screenshot
      ? `
        <div class="screenshot">
          <p>Payment Screenshot</p>
          <img
            src="${method.screenshot}"
            alt="Payment screenshot"
          />
        </div>
      `
      : ''
  }

  <div class="footer">
    This summary was generated automatically from the payment method record.
  </div>

</body>
</html>
`;

  win.document.open();
  win.document.write(html);
  win.document.close();

  win.onload = () => {
    win.focus();
    win.print();
  };
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>

          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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
// Add / Edit Payment Method Modal
// ---------------------------------------------------------------------------

function MethodModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(
    initial ? { ...initial } : { ...EMPTY_FORM }
  );

  const [error, setError] = useState('');

  const setField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setError('');
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setField('screenshot', reader.result);
    };

    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!form.clientName.trim() || !form.name.trim() || !form.account.trim()) {
      setError(
        'Please fill in the client name, method name, and account details.'
      );
      return;
    }

    onSave({
      ...form,
      clientName: form.clientName.trim(),
      name: form.name.trim(),
      account: form.account.trim(),
      sub: form.sub.trim(),
    });
  };

  const inputClass =
    'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100';

  return (
    <Modal
      title={initial ? 'Edit Payment Method' : 'Add Payment Method'}
      onClose={onClose}
    >
      <div className="flex flex-col gap-3">
        {/* Client */}
        <label className="text-xs text-slate-500">
          Client Name
          <input
            className={inputClass}
            placeholder="e.g. Usman Khan"
            value={form.clientName}
            onChange={(e) => setField('clientName', e.target.value)}
          />
        </label>

        {/* Method Name */}
        <label className="text-xs text-slate-500">
          Method Name
          <input
            className={inputClass}
            placeholder="e.g. Bank Transfer - UBL"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
          />
        </label>

        {/* Type */}
        <label className="text-xs text-slate-500">
          Type
          <select
            className={inputClass}
            value={form.type}
            onChange={(e) => setField('type', e.target.value)}
          >
            {TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        {/* Account */}
        <label className="text-xs text-slate-500">
          Account / Details
          <input
            className={inputClass}
            placeholder="e.g. Account: 1234567890001"
            value={form.account}
            onChange={(e) => setField('account', e.target.value)}
          />
        </label>

        {/* Note */}
        <label className="text-xs text-slate-500">
          Additional Note
          <input
            className={inputClass}
            placeholder="Optional"
            value={form.sub}
            onChange={(e) => setField('sub', e.target.value)}
          />
        </label>

        {/* Screenshot */}
        {ONLINE_TYPES.includes(form.type) && (
          <div className="text-xs text-slate-500">
            <span>Payment Screenshot</span>

            <div className="mt-2">
              {form.screenshot ? (
                <div className="relative inline-block">
                  <img
                    src={form.screenshot}
                    alt="Payment screenshot"
                    className="h-24 w-24 rounded-lg object-cover ring-1 ring-slate-200"
                  />

                  <button
                    type="button"
                    onClick={() => setField('screenshot', null)}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-slate-700"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500 hover:border-blue-400 hover:text-blue-600">
                  <ImagePlus size={14} />
                  Upload payment screenshot
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFile}
                  />
                </label>
              )}
            </div>

            <p className="mt-1 text-[11px] text-slate-400">
              Optional proof for bank, wallet, or card payments.
            </p>
          </div>
        )}

        {/* Status */}
        <label className="flex items-center justify-between text-xs text-slate-500">
          Status
          <button
            type="button"
            onClick={() =>
              setField(
                'status',
                form.status === 'Active' ? 'Inactive' : 'Active'
              )
            }
            className={`relative h-6 w-11 rounded-full transition-colors ${
              form.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                form.status === 'Active' ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>

        {/* Error */}
        {error && <p className="text-xs text-red-500">{error}</p>}

        {/* Buttons */}
        <div className="mt-3 flex justify-end gap-2">
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
            {initial ? 'Save Changes' : 'Add Method'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Delete Confirmation
// ---------------------------------------------------------------------------

function DeleteConfirm({ method, onClose, onConfirm }) {
  return (
    <Modal title="Delete Payment Method" onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <Trash2 size={20} />
        </div>

        <p className="mt-4 text-sm text-slate-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-800">{method.name}</span>?
        </p>

        <p className="mt-1 text-xs text-slate-400">
          This action cannot be undone.
        </p>

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
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function PaymentMethods() {
  // No dummy/seed data.
  // The page starts with an empty list.
  const { methods, addMethod, updateMethod, deleteMethodById } =
    usePaymentMethods();

  const [search, setSearch] = useState('');

  const [addOpen, setAddOpen] = useState(false);

  const [editMethod, setEditMethod] = useState(null);

  const [deleteMethod, setDeleteMethod] = useState(null);

  const [viewingScreenshot, setViewingScreenshot] = useState(null);

  // -------------------------------------------------------------------------
  // Search
  // -------------------------------------------------------------------------

  const filteredMethods = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return methods;
    }

    return methods.filter(
      (method) =>
        method.name.toLowerCase().includes(term) ||
        method.clientName?.toLowerCase().includes(term) ||
        method.type.toLowerCase().includes(term) ||
        method.account.toLowerCase().includes(term)
    );
  }, [methods, search]);

  // -------------------------------------------------------------------------
  // Add
  // -------------------------------------------------------------------------

  const handleAdd = async (form) => {
    try {
      await addMethod(form);
      setAddOpen(false);
    } catch (error) {
      console.error(error);
      alert('Could not save payment method.');
    }
  };

  // -------------------------------------------------------------------------
  // Edit
  // -------------------------------------------------------------------------

 const handleEditSave = async (form) => {
    try {
      await updateMethod(editMethod.id, form);
      setEditMethod(null);
    } catch (error) {
      console.error(error);
      alert('Could not save changes.');
    }
  };

  // -------------------------------------------------------------------------
  // Delete
  // -------------------------------------------------------------------------

  const handleDeleteConfirm = async () => {
    if (!deleteMethod) return;

    try {
      await deleteMethodById(deleteMethod.id);
      setDeleteMethod(null);
    } catch (error) {
      console.error(error);
      alert('Could not delete payment method.');
    }
  };

  // -------------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------------

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans">
      <main className="flex-1 overflow-y-auto px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Payment Methods
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage all payment methods used in your transactions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-64">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Search payment methods..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Add button */}
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <Plus size={16} />
              Add Payment Method
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="px-5 py-3 font-medium">Method Name</th>

                  <th className="px-5 py-3 font-medium">Client</th>

                  <th className="px-5 py-3 font-medium">Type</th>

                  <th className="px-5 py-3 font-medium">Account / Details</th>

                  <th className="px-5 py-3 font-medium">Status</th>

                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredMethods.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <Landmark size={22} />
                        </div>

                        <h3 className="mt-3 text-sm font-semibold text-slate-700">
                          {search
                            ? 'No payment methods found'
                            : 'No payment methods yet'}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          {search
                            ? 'Try another search term.'
                            : 'Add your first payment method to get started.'}
                        </p>

                        {!search && (
                          <button
                            onClick={() => setAddOpen(true)}
                            className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
                          >
                            <Plus size={14} />
                            Add Payment Method
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMethods.map((method) => {
                    const meta = TYPE_ICONS[method.type] || TYPE_ICONS.Bank;

                    const Icon = meta.icon;

                    return (
                      <tr
                        key={method.id}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
                      >
                        {/* Method */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.bg} ${meta.fg}`}
                            >
                              <Icon size={15} />
                            </span>

                            <span className="font-medium text-slate-700">
                              {method.name}
                            </span>
                          </div>
                        </td>

                        {/* Client */}
                        <td className="px-5 py-3.5 text-slate-600">
                          {method.clientName || '—'}
                        </td>

                        {/* Type */}
                        <td className="px-5 py-3.5 text-slate-600">
                          {method.type}
                        </td>

                        {/* Account */}
                        <td className="px-5 py-3.5 text-slate-600">
                          <div>{method.account}</div>

                          {method.sub && (
                            <div className="text-xs text-slate-400">
                              {method.sub}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              statusStyles[method.status]
                            }`}
                          >
                            {method.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-3">
                            {/* Edit */}
                            <button
                              onClick={() => setEditMethod(method)}
                              title="Edit payment method"
                              className="rounded-md p-1 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil size={15} />
                            </button>

                            {/* Screenshot */}
                            {method.screenshot && (
                              <button
                                onClick={() => setViewingScreenshot(method)}
                                title="View payment screenshot"
                                className="rounded-md p-1 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Eye size={15} />
                              </button>
                            )}

                            {/* PDF */}
                            <button
                              onClick={() => downloadMethodSummary(method)}
                              title="Download PDF"
                              className="rounded-md p-1 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                            >
                              <FileDown size={15} />
                            </button>

                            {/* DELETE */}
                            <button
                              onClick={() => setDeleteMethod(method)}
                              title="Delete payment method"
                              className="rounded-md p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add */}
      {addOpen && (
        <MethodModal onClose={() => setAddOpen(false)} onSave={handleAdd} />
      )}

      {/* Edit */}
      {editMethod && (
        <MethodModal
          initial={editMethod}
          onClose={() => setEditMethod(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Delete */}
      {deleteMethod && (
        <DeleteConfirm
          method={deleteMethod}
          onClose={() => setDeleteMethod(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Screenshot Preview */}
      {viewingScreenshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
          onClick={() => setViewingScreenshot(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  {viewingScreenshot.name}
                </div>

                <div className="text-xs text-slate-400">
                  {viewingScreenshot.clientName}
                </div>
              </div>

              <button
                onClick={() => setViewingScreenshot(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <img
              src={viewingScreenshot.screenshot}
              alt={`${viewingScreenshot.name} payment screenshot`}
              className="max-h-[70vh] w-full rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
