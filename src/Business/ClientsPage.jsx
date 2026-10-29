import { useMemo, useState } from 'react';
import { useClients } from './hooks/useClients';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Download,
  RotateCcw,
  Eye,
  Pencil,
  Trash2,
  X,
  Phone,
  Mail,
  Building2,
} from 'lucide-react';

/* ------------------------------- Constants ------------------------------- */


const STATUS_STYLES = {
  Active: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  Inactive: 'bg-slate-100 text-slate-500 border border-slate-200',
  Lead: 'bg-amber-50 text-amber-600 border border-amber-200',
};

const EMPTY_FORM = {
  name: '',
  phone: '',
  email: '',
  type: 'Buyer',
  status: 'Lead',
  notes: '',
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

/* ------------------------------- Helpers ------------------------------- */

function initials(name) {
  return name
    ? name
        .trim()
        .split(/\s+/)
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CL';
}

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

/* ----------------------------- Export PDF Report ----------------------------- */

function printClientsPDF(clients) {
  const win = window.open('', '_blank');

  if (!win) {
    alert('Please allow pop-ups to export the report.');
    return;
  }

  const rowsHtml =
    clients.length > 0
      ? clients
          .map(
            (client) => `
              <tr>
                <td><strong>${client.name}</strong></td>

                <td>
                  ${client.phone || '-'}
                  <br />
                  <span style="color:#64748b; font-size:11px;">
                    ${client.email || '-'}
                  </span>
                </td>

                <td>${client.type}</td>

                <td>
                  <span class="status ${client.status.toLowerCase()}">
                    ${client.status}
                  </span>
                </td>

                <td style="text-align:center;">
                  ${client.properties || 0}
                </td>

                <td>${client.lastContact || '-'}</td>
              </tr>
            `
          )
          .join('')
      : `
          <tr>
            <td colspan="6" style="text-align:center; padding:30px; color:#94a3b8;">
              No clients available.
            </td>
          </tr>
        `;

  win.document.write(`
    <html>
      <head>
        <title>Clients Report</title>

        <style>
          body {
            font-family:
              'Segoe UI',
              Tahoma,
              Geneva,
              Verdana,
              sans-serif;
            padding: 30px;
            color: #1e293b;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0b1830;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }

          .title {
            font-size: 22px;
            font-weight: 700;
            color: #0b1830;
            margin: 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 12px;
          }

          th {
            background: #f8fafc;
            color: #475569;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.5px;
            text-align: left;
            padding: 10px;
            border-bottom: 1px solid #cbd5e1;
          }

          td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
          }

          .status {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
          }

          .status.active {
            background: #ecfdf5;
            color: #059669;
          }

          .status.lead {
            background: #fffbeb;
            color: #d97706;
          }

          .status.inactive {
            background: #f1f5f9;
            color: #64748b;
          }

          .footer {
            margin-top: 30px;
            font-size: 11px;
            color: #94a3b8;
            text-align: center;
            border-top: 1px solid #f1f5f9;
            padding-top: 15px;
          }
        </style>
      </head>

      <body>

        <div class="header">

          <div>
            <h1 class="title">
              Clients Summary Directory
            </h1>

            <div
              style="
                font-size:12px;
                color:#64748b;
                margin-top:4px;
              "
            >
              Real Estate Management
            </div>
          </div>

          <div
            style="
              text-align:right;
              font-size:12px;
              color:#64748b;
            "
          >
            Total Records:
            <strong>${clients.length}</strong>

            <br />

            Date:
            ${new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>

        </div>

        <table>

          <thead>
            <tr>
              <th>Client Name</th>
              <th>Contact Details</th>
              <th>Type</th>
              <th>Status</th>
              <th style="text-align:center;">
                Properties
              </th>
              <th>Last Contact</th>
            </tr>
          </thead>

          <tbody>
            ${rowsHtml}
          </tbody>

        </table>

        <div class="footer">
          Generated via Real Estate Dashboard
        </div>

      </body>
    </html>
  `);

  win.document.close();
  win.focus();

  setTimeout(() => {
    win.print();
  }, 300);
}

/* ------------------------------- Stat Card ------------------------------- */

function StatCard({ label, value, sub, icon: Icon, bg, fg }) {
  return (
    <div className="flex-1 min-w-[190px] bg-white rounded-xl border border-slate-100 px-4 py-4 flex items-start gap-3 shadow-sm">
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

/* --------------------------- Client Form Modal --------------------------- */

function ClientFormModal({ initialData, onClose, onSave }) {
  const [form, setForm] = useState(initialData || EMPTY_FORM);

  const [error, setError] = useState('');

  const update = (key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value,
    }));

    setError('');
  };

  const handleSubmit = () => {
    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();

    if (!name || !phone) {
      setError('Name and Phone are required.');
      return;
    }

    const client = {
      id: form.id,

      name,

      phone,

      email: email || '-',

      type: form.type,

      status: form.status,

      properties: form.properties || 0,

      lastContact: form.id
        ? form.lastContact
        : new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),

      color: form.color || getRandomColor(),

      notes: form.notes?.trim() || '',
    };

    onSave(client);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Modal Header */}

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-[16px] font-semibold text-slate-800">
            {form.id ? 'Edit Client' : 'Add Client'}
          </h2>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="text-[12.5px] text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
              {error}
            </div>
          )}

          {/* Name */}

          <div>
            <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
              Full Name *
            </label>

            <input
              value={form.name}
              onChange={update('name')}
              placeholder="Enter client name"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          {/* Phone + Email */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
                Phone *
              </label>

              <input
                value={form.phone}
                onChange={update('phone')}
                placeholder="0300-1234567"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            <div>
              <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
                Email
              </label>

              <input
                value={form.email}
                onChange={update('email')}
                placeholder="name@example.com"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          </div>

          {/* Type + Status */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
                Type
              </label>

              <select
                value={form.type}
                onChange={update('type')}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
              >
                <option value="Buyer">Buyer</option>

                <option value="Seller">Seller</option>

                <option value="Tenant">Tenant</option>
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
                <option value="Lead">Lead</option>

                <option value="Active">Active</option>

                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Notes */}

          <div>
            <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
              Notes
            </label>

            <textarea
              value={form.notes}
              onChange={update('notes')}
              rows={3}
              placeholder="Optional notes about this client..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
            />
          </div>
        </div>

        {/* Modal Footer */}

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
            {form.id ? 'Update Client' : 'Save Client'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- View Client Modal ---------------------------- */

function ViewClientModal({ client, onClose }) {
  if (!client) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
        {/* Profile Header */}

        <div
          className={`h-28 ${client.color} flex items-center justify-center relative p-6`}
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xl font-bold border-2 border-white/40">
            {initials(client.name)}
          </div>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 text-white rounded-full p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Name */}

          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-800">{client.name}</h2>

            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                {client.type}
              </span>

              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  STATUS_STYLES[client.status]
                }`}
              >
                {client.status}
              </span>
            </div>
          </div>

          {/* Contact Information */}

          <div className="mt-6 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-[13px]">
            <div className="flex items-center gap-3 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />

              <span>{client.phone || '-'}</span>
            </div>

            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />

              <span>{client.email || '-'}</span>
            </div>

            <div className="flex items-center gap-3 text-slate-600">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />

              <span>{client.properties || 0} Associated Properties</span>
            </div>
          </div>

          {/* Notes */}

          {client.notes && (
            <div className="mt-4">
              <h4 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Notes
              </h4>

              <p className="text-[13px] text-slate-600 bg-amber-50/50 border border-amber-100 p-3 rounded-lg italic">
                "{client.notes}"
              </p>
            </div>
          )}

          {/* Last Contact */}

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
            <span>Last Contacted:</span>

            <span className="font-medium text-slate-600">
              {client.lastContact || '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Main Component ------------------------------ */

export default function ClientsPage() {
  const { clients, addClient, updateClient, deleteClientById } = useClients();

  const [modalMode, setModalMode] = useState(null);

  const [selectedClient, setSelectedClient] = useState(null);

  const [viewClient, setViewClient] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');

  const [statusFilter, setStatusFilter] = useState('All Status');

  const [typeFilter, setTypeFilter] = useState('All Types');

  /* ------------------------- Save Client ------------------------- */

  const handleSave = async (client) => {
    try {
      if (modalMode === 'edit') {
        await updateClient(client.id, client);
      } else {
        await addClient(client);
      }
    } catch (error) {
      console.error(error);
      alert('Could not save client.');
      return;
    }

    setModalMode(null);
    setSelectedClient(null);
  };

  /* ------------------------- Delete Client ------------------------- */

  const handleDelete = async (id) => {
    const client = clients.find((item) => item.id === id);

    if (!client) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${client.name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteClientById(id);

      if (viewClient?.id === id) {
        setViewClient(null);
      }
    } catch (error) {
      console.error(error);
      alert('Could not delete client.');
    }
  };

  /* ------------------------- Search + Filters ------------------------- */

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return clients.filter((client) => {
      const statusOk =
        statusFilter === 'All Status' || client.status === statusFilter;

      const typeOk = typeFilter === 'All Types' || client.type === typeFilter;

      const searchOk =
        !query ||
        client.name?.toLowerCase().includes(query) ||
        client.phone?.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query);

      return statusOk && typeOk && searchOk;
    });
  }, [clients, statusFilter, typeFilter, searchQuery]);

  /* ------------------------- Statistics ------------------------- */

  const counts = useMemo(
    () => ({
      total: clients.length,

      active: clients.filter((client) => client.status === 'Active').length,

      leads: clients.filter((client) => client.status === 'Lead').length,

      inactive: clients.filter((client) => client.status === 'Inactive').length,
    }),
    [clients]
  );

  /* ------------------------- Reset Filters ------------------------- */

  const resetFilters = () => {
    setStatusFilter('All Status');
    setTypeFilter('All Types');
    setSearchQuery('');
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
        {/* Header */}

        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-slate-800">
              Clients
            </h1>

            <p className="text-[13px] text-slate-400 mt-0.5">
              View and manage all your clients in one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Export */}

            <button
              onClick={() => printClientsPDF(filtered)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-600 hover:bg-slate-50 transition shadow-sm"
            >
              <Download className="w-4 h-4 text-slate-500" strokeWidth={1.8} />
              Export PDF
            </button>

            {/* Add */}

            <button
              onClick={() => {
                setSelectedClient(null);
                setModalMode('add');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0b1830] text-white text-[13px] font-medium hover:bg-[#0f2140] transition shadow-sm"
            >
              <UserPlus className="w-4 h-4" strokeWidth={2} />
              Add Client
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Statistics */}

          <div className="flex flex-wrap gap-4">
            <StatCard
              label="Total Clients"
              value={counts.total}
              sub="All records"
              icon={Users}
              bg="bg-sky-50"
              fg="text-sky-500"
            />

            <StatCard
              label="Active Clients"
              value={counts.active}
              sub="Currently engaged"
              icon={UserCheck}
              bg="bg-emerald-50"
              fg="text-emerald-500"
            />

            <StatCard
              label="Leads"
              value={counts.leads}
              sub="Not yet converted"
              icon={UserPlus}
              bg="bg-amber-50"
              fg="text-amber-500"
            />

            <StatCard
              label="Inactive"
              value={counts.inactive}
              sub="No recent activity"
              icon={UserX}
              bg="bg-rose-50"
              fg="text-rose-500"
            />
          </div>

          {/* Search + Filters */}

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

              <input
                type="text"
                placeholder="Search clients by name, phone, email..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-[13px] text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            {/* Type */}

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-600 focus:outline-none cursor-pointer"
            >
              <option value="All Types">All Types</option>

              <option value="Buyer">Buyer</option>

              <option value="Seller">Seller</option>

              <option value="Tenant">Tenant</option>
            </select>

            {/* Status */}

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-600 focus:outline-none cursor-pointer"
            >
              <option value="All Status">All Status</option>

              <option value="Active">Active</option>

              <option value="Lead">Lead</option>

              <option value="Inactive">Inactive</option>
            </select>

            {/* Reset */}

            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-600 hover:bg-slate-50 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>

          {/* Clients Table */}

          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
            {/* Desktop Table */}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11.5px] text-slate-400 uppercase tracking-wide bg-slate-50/50">
                    <th className="px-5 py-3 font-medium">Client</th>

                    <th className="px-5 py-3 font-medium">Contact</th>

                    <th className="px-5 py-3 font-medium">Type</th>

                    <th className="px-5 py-3 font-medium">Properties</th>

                    <th className="px-5 py-3 font-medium">Status</th>

                    <th className="px-5 py-3 font-medium">Last Contact</th>

                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                            <Users className="w-5 h-5 text-slate-400" />
                          </div>

                          <p className="text-[14px] font-medium text-slate-600">
                            {clients.length === 0
                              ? 'No clients added yet'
                              : 'No clients found'}
                          </p>

                          <p className="text-[12px] text-slate-400 mt-1">
                            {clients.length === 0
                              ? 'Click Add Client to create your first client.'
                              : 'Try changing your search or filters.'}
                          </p>

                          {clients.length === 0 && (
                            <button
                              onClick={() => {
                                setSelectedClient(null);
                                setModalMode('add');
                              }}
                              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0b1830] text-white text-[13px] font-medium hover:bg-[#0f2140] transition"
                            >
                              <UserPlus className="w-4 h-4" />
                              Add First Client
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((client) => (
                      <tr
                        key={client.id}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 text-[13px]"
                      >
                        {/* Client */}

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-full ${
                                client.color || 'bg-slate-500'
                              } flex items-center justify-center text-white text-[11px] font-medium shrink-0 shadow-sm`}
                            >
                              {initials(client.name)}
                            </div>

                            <span className="text-slate-700 font-medium truncate">
                              {client.name}
                            </span>
                          </div>
                        </td>

                        {/* Contact */}

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                            {client.phone || '-'}
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-400 text-[11.5px] mt-0.5">
                            <Mail className="w-3.5 h-3.5 shrink-0" />

                            {client.email || '-'}
                          </div>
                        </td>

                        {/* Type */}

                        <td className="px-5 py-3.5 text-slate-600">
                          {client.type}
                        </td>

                        {/* Properties */}

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />

                            {client.properties || 0}
                          </div>
                        </td>

                        {/* Status */}

                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              STATUS_STYLES[client.status] || STATUS_STYLES.Lead
                            }`}
                          >
                            {client.status}
                          </span>
                        </td>

                        {/* Last Contact */}

                        <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                          {client.lastContact || '-'}
                        </td>

                        {/* Actions */}

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3 text-slate-400">
                            {/* View */}

                            <button
                              onClick={() => setViewClient(client)}
                              title="View Client"
                              className="hover:text-slate-700 transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit */}

                            <button
                              onClick={() => {
                                setSelectedClient(client);
                                setModalMode('edit');
                              }}
                              title="Edit Client"
                              className="hover:text-slate-700 transition"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            {/* Delete */}

                            <button
                              onClick={() => handleDelete(client.id)}
                              title="Delete Client"
                              className="hover:text-rose-500 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}

      {modalMode && (
        <ClientFormModal
          initialData={selectedClient}
          onClose={() => {
            setModalMode(null);
            setSelectedClient(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* View Modal */}

      {viewClient && (
        <ViewClientModal
          client={viewClient}
          onClose={() => setViewClient(null)}
        />
      )}
    </div>
  );
}
