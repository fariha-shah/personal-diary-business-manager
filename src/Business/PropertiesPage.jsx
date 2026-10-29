import { useMemo, useState } from 'react';
import { useProperties } from './hooks/useProperties';
import {
  Home,
  Building2,
  Users,
  Handshake,
  MapPin,
  Plus,
  Search,
  Download,
  RotateCcw,
  Eye,
  Pencil,
  Trash2,
  X,
  Bed,
  Bath,
  Ruler,
  Layers,
  FileText,
} from 'lucide-react';

/* ----------------------------- Local Storage ----------------------------- */


const STATUS_STYLES = {
  Available: 'bg-emerald-50 text-emerald-600 border border-emerald-200',

  Sold: 'bg-rose-50 text-rose-600 border border-rose-200',

  Rented: 'bg-amber-50 text-amber-600 border border-amber-200',
};

const EMPTY_FORM = {
  title: '',
  type: 'House',
  status: 'Available',
  city: '',
  address: '',
  price: '',
  beds: '',
  baths: '',
  area: '',
};

const PROPERTY_COLORS = [
  'bg-sky-500',
  'bg-emerald-500',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-teal-500',
  'bg-fuchsia-500',
];

/* ------------------------------- PDF Helpers ------------------------------- */

function printPropertyPDF(p) {
  const win = window.open('', '_blank');

  if (!win) return;

  win.document.write(`
    <html>
      <head>
        <title>${p.title} - Property Brochure</title>

        <style>
          body {
            font-family:
              'Segoe UI',
              Tahoma,
              Geneva,
              Verdana,
              sans-serif;
            padding: 40px;
            color: #1e293b;
            background: #fff;
          }

          .header {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 24px;
          }

          .title {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
          }

          .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 8px;
            background: #f1f5f9;
            color: #475569;
          }

          .price {
            font-size: 22px;
            font-weight: 700;
            color: #059669;
            margin: 16px 0;
          }

          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 24px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
          }

          .item-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .item-val {
            font-size: 14px;
            font-weight: 600;
            color: #334155;
            margin-top: 2px;
          }

          .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #94a3b8;
            text-align: center;
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
          }
        </style>
      </head>

      <body>
        <div class="header">
          <h1 class="title">${p.title}</h1>

          <span class="status">
            ${p.status.toUpperCase()} • ${p.type}
          </span>

          <div class="price">
            PKR ${p.price}
          </div>
        </div>

        <div>
          <strong style="font-size: 14px; color: #475569;">
            Location:
          </strong>

          <p style="margin: 4px 0; font-size: 15px;">
            ${p.address || p.city}
          </p>
        </div>

        <div class="grid">

          <div>
            <div class="item-label">Property Type</div>
            <div class="item-val">${p.type}</div>
          </div>

          <div>
            <div class="item-label">City</div>
            <div class="item-val">${p.city}</div>
          </div>

          <div>
            <div class="item-label">Bedrooms</div>
            <div class="item-val">${p.beds || 'N/A'}</div>
          </div>

          <div>
            <div class="item-label">Bathrooms</div>
            <div class="item-val">${p.baths || 'N/A'}</div>
          </div>

          <div>
            <div class="item-label">Covered Area</div>
            <div class="item-val">${p.area || 'N/A'}</div>
          </div>

          <div>
            <div class="item-label">Listing ID</div>
            <div class="item-val">#PROP-${p.id}</div>
          </div>

        </div>

        <div class="footer">
          Generated on ${new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}

          — Real Estate Dashboard
        </div>
      </body>
    </html>
  `);

  win.document.close();
  win.focus();

  setTimeout(() => {
    win.print();
  }, 250);
}

/* -------------------------- All Properties PDF -------------------------- */

function printAllPropertiesPDF(properties) {
  const win = window.open('', '_blank');

  if (!win) return;

  const rowsHtml = properties
    .map(
      (p) => `
        <tr>
          <td>#${p.id}</td>

          <td>
            <strong>${p.title}</strong>
          </td>

          <td>${p.type}</td>

          <td>
            <span class="status ${p.status.toLowerCase()}">
              ${p.status}
            </span>
          </td>

          <td>${p.address}</td>

          <td style="text-align: right; font-weight: 600; color: #059669;">
            PKR ${p.price}
          </td>

          <td style="text-align: center;">
            ${p.beds || '-'} / ${p.baths || '-'}
          </td>

          <td style="text-align: right;">
            ${p.area || '-'}
          </td>
        </tr>
      `
    )
    .join('');

  win.document.write(`
    <html>
      <head>

        <title>Properties Summary Report</title>

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
            background: #fff;
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

          .subtitle {
            font-size: 13px;
            color: #64748b;
            margin-top: 4px;
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
            font-size: 10.5px;
            letter-spacing: 0.5px;
            text-align: left;
            padding: 10px 12px;
            border-bottom: 1px solid #cbd5e1;
          }

          td {
            padding: 10px 12px;
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

          .status.available {
            background: #ecfdf5;
            color: #059669;
          }

          .status.sold {
            background: #fef2f2;
            color: #dc2626;
          }

          .status.rented {
            background: #fffbeb;
            color: #d97706;
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
              Property Inventory Report
            </h1>

            <div class="subtitle">
              Generated List of Properties
            </div>
          </div>

          <div
            style="
              text-align: right;
              font-size: 12px;
              color: #64748b;
            "
          >
            Total Records:
            <strong>${properties.length}</strong>

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
              <th>ID</th>
              <th>Property</th>
              <th>Type</th>
              <th>Status</th>
              <th>Address</th>
              <th style="text-align: right;">
                Price
              </th>
              <th style="text-align: center;">
                Beds/Baths
              </th>
              <th style="text-align: right;">
                Area
              </th>
            </tr>

          </thead>

          <tbody>
            ${rowsHtml}
          </tbody>

        </table>

        <div class="footer">
          Real Estate Management System — Printed Summary
        </div>

      </body>
    </html>
  `);

  win.document.close();
  win.focus();

  setTimeout(() => {
    win.print();
  }, 250);
}

/* -------------------------------- Stat Card -------------------------------- */

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

/* ------------------------------- Property Card ------------------------------- */

function PropertyCard({ p, onView, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden flex flex-col shadow-xs hover:shadow-md transition-shadow duration-200">
      <div
        className={`h-32 ${p.color} bg-opacity-10 flex items-center justify-center relative`}
      >
        <div
          className={`w-14 h-14 rounded-xl ${p.color} flex items-center justify-center shadow-xs`}
        >
          <Building2 className="w-7 h-7 text-white" strokeWidth={1.8} />
        </div>

        <span
          className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[p.status]}`}
        >
          {p.status}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="text-[14px] font-semibold text-slate-800 truncate"
            title={p.title}
          >
            {p.title}
          </h3>

          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
            {p.type}
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-400 text-[12px] mt-1">
          <MapPin className="w-3.5 h-3.5 shrink-0" />

          <span className="truncate">{p.address}</span>
        </div>

        <div className="text-[16px] font-semibold text-slate-800 mt-3">
          PKR {p.price}
        </div>

        <div className="flex items-center gap-4 text-[12px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
          {p.type !== 'Plot' && p.type !== 'Commercial' && (
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" />
              {p.beds} Beds
            </span>
          )}

          {p.type !== 'Plot' && (
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" />
              {p.baths} Baths
            </span>
          )}

          <span className="flex items-center gap-1">
            <Ruler className="w-3.5 h-3.5" />
            {p.area}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-4 pt-2">
          <button
            onClick={() => onView(p)}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            View
          </button>

          <button
            onClick={() => onEdit(p)}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
            title="Edit Property"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => printPropertyPDF(p)}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
            title="Download PDF Brochure"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(p.id)}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-rose-500 hover:bg-rose-50 transition"
            title="Delete Property"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Add/Edit Property Modal --------------------------- */

function PropertyFormModal({ initialData, onClose, onSave }) {
  const [form, setForm] = useState(initialData || EMPTY_FORM);

  const [error, setError] = useState('');

  const update = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.city.trim() || !form.price.trim()) {
      setError('Title, City, and Price are required.');

      return;
    }

    const property = {
      id: form.id,

      title: form.title.trim(),

      type: form.type,

      status: form.status,

      city: form.city.trim(),

      address: form.address.trim() || form.city.trim(),

      price: form.price.trim(),

      beds: form.beds || 0,

      baths: form.baths || 0,

      area: form.area.trim() || '-',

      color:
        form.color ||
        PROPERTY_COLORS[Math.floor(Math.random() * PROPERTY_COLORS.length)],
    };

    onSave(property);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-[16px] font-semibold text-slate-800">
            {form.id ? 'Edit Property' : 'Add Property'}
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
              Property Title *
            </label>

            <input
              value={form.title}
              onChange={update('title')}
              placeholder="e.g. 10 Marla House"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
                Type
              </label>

              <select
                value={form.type}
                onChange={update('type')}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
              >
                {['House', 'Apartment', 'Commercial', 'Plot', 'Farm House'].map(
                  (type) => (
                    <option key={type}>{type}</option>
                  )
                )}
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
                {['Available', 'Sold', 'Rented'].map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
                City *
              </label>

              <input
                value={form.city}
                onChange={update('city')}
                placeholder="e.g. Lahore"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            <div>
              <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
                Price (PKR) *
              </label>

              <input
                value={form.price}
                onChange={update('price')}
                placeholder="e.g. 18,500,000"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          </div>

          <div>
            <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
              Address
            </label>

            <input
              value={form.address}
              onChange={update('address')}
              placeholder="e.g. DHA Phase 6, Lahore"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[12.5px] font-medium text-slate-600 mb-1 flex items-center gap-1">
                <Bed className="w-3.5 h-3.5" />
                Beds
              </label>

              <input
                value={form.beds}
                onChange={update('beds')}
                type="number"
                min="0"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            <div>
              <label className="text-[12.5px] font-medium text-slate-600 mb-1 flex items-center gap-1">
                <Bath className="w-3.5 h-3.5" />
                Baths
              </label>

              <input
                value={form.baths}
                onChange={update('baths')}
                type="number"
                min="0"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            <div>
              <label className="text-[12.5px] font-medium text-slate-600 mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Area
              </label>

              <input
                value={form.area}
                onChange={update('area')}
                placeholder="1,100 sqft"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
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
            {form.id ? 'Update Property' : 'Save Property'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- View Modal ------------------------------- */

function ViewPropertyModal({ property, onClose }) {
  if (!property) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
        <div
          className={`h-36 ${property.color} flex items-center justify-center relative`}
        >
          <Building2 className="w-12 h-12 text-white" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 text-white rounded-full p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {property.title}
              </h2>

              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {property.address}
              </p>
            </div>

            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_STYLES[property.status]}`}
            >
              {property.status}
            </span>
          </div>

          <div className="text-xl font-bold text-slate-900 mt-4">
            PKR {property.price}
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-50 rounded-xl p-3 my-5 border border-slate-100 text-center">
            <div>
              <span className="block text-[11px] text-slate-400">Beds</span>

              <span className="font-semibold text-slate-700 text-sm">
                {property.beds || 'N/A'}
              </span>
            </div>

            <div>
              <span className="block text-[11px] text-slate-400">Baths</span>

              <span className="font-semibold text-slate-700 text-sm">
                {property.baths || 'N/A'}
              </span>
            </div>

            <div>
              <span className="block text-[11px] text-slate-400">Area</span>

              <span className="font-semibold text-slate-700 text-sm">
                {property.area || 'N/A'}
              </span>
            </div>
          </div>

          <button
            onClick={() => printPropertyPDF(property)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
          >
            <FileText className="w-4 h-4" />
            Export PDF Brochure
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------- Main Page ----------------------------------- */

export default function PropertiesPage() {
  const { properties, addProperty, updateProperty, deletePropertyById } =
    useProperties();

  const [modalMode, setModalMode] = useState(null);

  const [selectedProperty, setSelectedProperty] = useState(null);

  const [viewProperty, setViewProperty] = useState(null);

  const [statusFilter, setStatusFilter] = useState('All Status');

  const [typeFilter, setTypeFilter] = useState('All Types');

  const [searchQuery, setSearchQuery] = useState('');

  /* ------------------------------ Save ------------------------------ */

 const handleSave = async (property) => {
    try {
      if (modalMode === 'edit') {
        await updateProperty(property.id, property);
      } else {
        await addProperty(property);
      }
    } catch (error) {
      console.error(error);
      alert('Could not save property.');
      return;
    }

    setModalMode(null);
    setSelectedProperty(null);
  };

  /* ----------------------------- Delete ----------------------------- */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this property?'
    );

    if (!confirmed) return;

    try {
      await deletePropertyById(id);
    } catch (error) {
      console.error(error);
      alert('Could not delete property.');
    }
  };

  /* ------------------------------ Filter ------------------------------ */

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return properties.filter((p) => {
      const statusOk =
        statusFilter === 'All Status' || p.status === statusFilter;

      const typeOk = typeFilter === 'All Types' || p.type === typeFilter;

      const searchOk =
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.address.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query);

      return statusOk && typeOk && searchOk;
    });
  }, [properties, statusFilter, typeFilter, searchQuery]);

  /* ------------------------------- Counts ------------------------------- */

  const counts = useMemo(
    () => ({
      total: properties.length,

      available: properties.filter((p) => p.status === 'Available').length,

      sold: properties.filter((p) => p.status === 'Sold').length,

      rented: properties.filter((p) => p.status === 'Rented').length,
    }),
    [properties]
  );

  /* -------------------------------- Render -------------------------------- */

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
        {/* Header */}

        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-slate-800">
              Properties
            </h1>

            <p className="text-[13px] text-slate-400 mt-0.5">
              View and manage all your listed properties.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => printAllPropertiesPDF(filtered)}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-600 hover:bg-slate-50 transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 text-slate-500" strokeWidth={1.8} />
              Export PDF Report
            </button>

            <button
              onClick={() => {
                setSelectedProperty(null);
                setModalMode('add');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0b1830] text-white text-[13px] font-medium hover:bg-[#0f2140] transition shadow-xs"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Add Property
            </button>
          </div>
        </div>

        {/* Stat Cards */}

        <div className="flex flex-wrap gap-4 mb-6">
          <StatCard
            label="Total Properties"
            value={counts.total}
            sub="All listings"
            icon={Building2}
            bg="bg-sky-50"
            fg="text-sky-500"
          />

          <StatCard
            label="Available"
            value={counts.available}
            sub="Ready to sell/rent"
            icon={Home}
            bg="bg-emerald-50"
            fg="text-emerald-500"
          />

          <StatCard
            label="Sold"
            value={counts.sold}
            sub="Closed deals"
            icon={Handshake}
            bg="bg-rose-50"
            fg="text-rose-500"
          />

          <StatCard
            label="Rented"
            value={counts.rented}
            sub="Active tenants"
            icon={Users}
            bg="bg-amber-50"
            fg="text-amber-500"
          />
        </div>

        {/* Filters */}

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              placeholder="Search properties by title or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-[13px] text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-600 focus:outline-none cursor-pointer"
          >
            {[
              'All Types',
              'House',
              'Apartment',
              'Commercial',
              'Plot',
              'Farm House',
            ].map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-600 focus:outline-none cursor-pointer"
          >
            {['All Status', 'Available', 'Sold', 'Rented'].map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setStatusFilter('All Status');
              setTypeFilter('All Types');
              setSearchQuery('');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-600 hover:bg-slate-50 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>

        {/* Properties */}

        {properties.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 py-16 px-5 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-5 h-5 text-slate-400" />
            </div>

            <h3 className="text-sm font-semibold text-slate-700">
              No properties yet
            </h3>

            <p className="text-[13px] text-slate-400 mt-1">
              Add your first property to start managing your listings.
            </p>

            <button
              onClick={() => {
                setSelectedProperty(null);
                setModalMode('add');
              }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0b1830] text-white text-[13px] font-medium hover:bg-[#0f2140] transition"
            >
              <Plus className="w-4 h-4" />
              Add Property
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 py-16 text-center text-slate-400 text-[13.5px]">
            No properties match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((property) => (
              <PropertyCard
                key={property.id}
                p={property}
                onView={(item) => setViewProperty(item)}
                onEdit={(item) => {
                  setSelectedProperty(item);
                  setModalMode('edit');
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}

      {modalMode && (
        <PropertyFormModal
          initialData={selectedProperty}
          onClose={() => {
            setModalMode(null);
            setSelectedProperty(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* View Modal */}

      {viewProperty && (
        <ViewPropertyModal
          property={viewProperty}
          onClose={() => setViewProperty(null)}
        />
      )}
    </div>
  );
}
