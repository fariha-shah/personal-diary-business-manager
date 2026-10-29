import React, { useMemo, useRef, useState } from 'react';
import {
  useDashboardTasks,
  useDashboardNotes,
  useDashboardProperties,
  useDashboardBuyers,
  useDashboardDeals,
} from './hooks/useDashboardWidgets';
import useCalendar from '../calendar/hooks/useCalendar';
import {
  Search,
  ChevronDown,
  Plus,
  Calendar,
  MapPin,
  Home,
  Users,
  Handshake,
  BellRing,
  FileText,
  FileCheck,
  Download,
  ArrowUp,
  ArrowDown,
  X,
  Trash2,
  Building2,
  UserPlus,
} from 'lucide-react';
/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function money(value) {
  if (!value) return 'PKR 0';

  return `PKR ${Number(value).toLocaleString('en-PK')}`;
}

function toLocalDateInputValue(date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);

  return local.toISOString().slice(0, 10);
}

/* -------------------------------------------------------------------------- */
/* Reusable Components                                                        */
/* -------------------------------------------------------------------------- */

const Card = React.forwardRef(function Card({ children, className = '' }, ref) {
  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
});

function CardHeader({ title, action, subtitle, onAction }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5">
      <div>
        <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>

        {subtitle && (
          <span className="text-xs text-gray-400 ml-1">{subtitle}</span>
        )}
      </div>

      {action && (
        <button
          onClick={onAction}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          {action}
        </button>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500">
        {label}
      </span>

      {children}
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Add Modal                                                                  */
/* -------------------------------------------------------------------------- */

function AddModal({ type, pipelineNames, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    location: '',
    price: '',
    property: '',
    amount: '',
    stage: pipelineNames[0] || '',
  });

  const [error, setError] = useState('');

  const titleMap = {
    property: 'Add Property',
    client: 'Add Client / Sale',
    deal: 'Add Deal',
  };

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError('');
  }

  function submit() {
    if (type === 'property') {
      if (!form.name.trim()) {
        setError('Property name is required.');
        return;
      }

      onSave({
        type,
        name: form.name.trim(),
        location: form.location.trim() || 'N/A',
        price: Number(form.price) || 0,
      });

      return;
    }

    if (type === 'client') {
      if (!form.name.trim() || !form.amount) {
        setError('Client name and amount are required.');
        return;
      }

      onSave({
        type,
        name: form.name.trim(),
        property: form.property.trim() || 'N/A',
        amount: Number(form.amount),
      });

      return;
    }

    if (type === 'deal') {
      if (!form.name.trim()) {
        setError('Client name is required.');
        return;
      }

      if (!form.stage) {
        setError('Please select a pipeline stage.');
        return;
      }

      onSave({
        type,
        name: form.name.trim(),
        property: form.property.trim() || 'N/A',
        stage: form.stage,
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">{titleMap[type]}</h2>

          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {type === 'property' && (
            <>
              <Field label="Property Name">
                <input
                  className="input"
                  placeholder="e.g. 10 Marla House"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </Field>

              <Field label="Location">
                <input
                  className="input"
                  placeholder="e.g. DHA Phase 6, Lahore"
                  value={form.location}
                  onChange={(e) => updateField('location', e.target.value)}
                />
              </Field>

              <Field label="Price (PKR)">
                <input
                  type="number"
                  className="input"
                  placeholder="e.g. 25000000"
                  value={form.price}
                  onChange={(e) => updateField('price', e.target.value)}
                />
              </Field>
            </>
          )}

          {type === 'client' && (
            <>
              <Field label="Client Name">
                <input
                  className="input"
                  placeholder="e.g. Mr. Kamran Sheikh"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </Field>

              <Field label="Property Purchased">
                <input
                  className="input"
                  placeholder="e.g. 5 Marla House, DHA"
                  value={form.property}
                  onChange={(e) => updateField('property', e.target.value)}
                />
              </Field>

              <Field label="Amount (PKR)">
                <input
                  type="number"
                  className="input"
                  placeholder="e.g. 6500000"
                  value={form.amount}
                  onChange={(e) => updateField('amount', e.target.value)}
                />
              </Field>
            </>
          )}

          {type === 'deal' && (
            <>
              <Field label="Client Name">
                <input
                  className="input"
                  placeholder="e.g. Mr. Tariq Javed"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </Field>

              <Field label="Property">
                <input
                  className="input"
                  placeholder="e.g. Office Space, MM Alam Road"
                  value={form.property}
                  onChange={(e) => updateField('property', e.target.value)}
                />
              </Field>

              <Field label="Pipeline Stage">
                <select
                  className="input"
                  value={form.stage}
                  onChange={(e) => updateField('stage', e.target.value)}
                >
                  <option value="">Select stage</option>

                  {pipelineNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}

          {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          font-size: 0.875rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          outline: none;
          background: white;
        }

        .input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.08);
        }
      `}</style>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Date Modal                                                                 */
/* -------------------------------------------------------------------------- */

function DateModal({ date, onClose, onSelect }) {
  const [value, setValue] = useState(toLocalDateInputValue(date));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Select Date</h2>

          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <Field label="Date">
            <input
              type="date"
              className="input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={() => onSelect(value)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Set Date
          </button>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          font-size: 0.875rem;
          border: 1px solid #e5e7eb;
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

/* -------------------------------------------------------------------------- */
/* Pipeline Modal                                                             */
/* -------------------------------------------------------------------------- */

function PipelineModal({ pipeline, onClose }) {
  const totalDeals = pipeline.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Deal Pipeline Details</h2>

          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {pipeline.length === 0 ? (
            <div className="py-8 text-center">
              <Handshake className="w-8 h-8 mx-auto text-gray-300 mb-2" />

              <p className="text-sm text-gray-400">No deals in pipeline yet.</p>
            </div>
          ) : (
            pipeline.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />

                  <span className="text-gray-700">{item.name}</span>
                </div>

                <span className="font-semibold text-gray-900">
                  {item.count} deals
                </span>
              </div>
            ))
          )}

          <div className="pt-3 mt-1 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">Total Active Deals</span>

            <span className="font-semibold text-gray-900">{totalDeals}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Pipeline Value</span>

            <span className="font-semibold text-gray-900">PKR 0</span>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-gray-100 px-5 py-4">
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

/* -------------------------------------------------------------------------- */
/* Activities Modal                                                           */
/* -------------------------------------------------------------------------- */

function ActivitiesModal({ activities, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">All Activities</h2>

          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="py-8 text-center">
              <BellRing className="w-8 h-8 mx-auto text-gray-300 mb-2" />

              <p className="text-sm text-gray-400">No activities yet.</p>
            </div>
          ) : (
            activities.map((activity, index) => {
              const Icon = activity.icon;

              return (
                <div key={index} className="flex gap-3 items-start">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activity.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {activity.title}
                    </p>

                    <p className="text-xs text-gray-400">{activity.subtitle}</p>
                  </div>

                  <p className="text-[11px] text-gray-400 whitespace-nowrap">
                    {activity.time}
                  </p>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-end border-t border-gray-100 px-5 py-4">
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

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

export default function Dashboard() {
  const [search, setSearch] = useState('');

  const { tasks, addTask: addTaskDoc, updateTask, deleteTask } = useDashboardTasks();
  const [newTask, setNewTask] = useState('');

  const { notes, addNote: addNoteDoc, deleteNote } = useDashboardNotes();
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');

  const { deals, addDeal } = useDashboardDeals();
  const { dashboardBuyers: buyers, addDashboardBuyer } = useDashboardBuyers();
  const { dashboardProperties: properties, addDashboardProperty } = useDashboardProperties();

  // Activities feed is derived (not its own collection) — built from
  // whatever's just been added below, kept in memory for this session.
  const [activities, setActivities] = useState([]);

  const { events: calendarEvents } = useCalendar();

  const pipeline = useMemo(() => {
    const stages = {};
    deals.forEach((deal) => {
      stages[deal.stage] = (stages[deal.stage] || 0) + 1;
    });
    return Object.entries(stages).map(([name, count]) => ({
      name,
      count,
      color: 'bg-blue-500',
    }));
  }, [deals]);

  const schedule = useMemo(() => {
    const todayKey = new Date().toDateString();

    return calendarEvents
      .filter((event) => {
        if (!event.date) return false;
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === todayKey;
      })
      .map((event) => ({
        time: event.time || '',
        date: event.date || '',
        title: event.title || 'Untitled event',
        subtitle: event.description || '',
        color: 'text-blue-600 bg-blue-50',
        icon: Calendar,
      }));
  }, [calendarEvents]);

  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [addType, setAddType] = useState(null);

  const [showDateModal, setShowDateModal] = useState(false);
  const [showPipelineModal, setShowPipelineModal] = useState(false);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());

  const [toast, setToast] = useState(null);

  const pipelineRef = useRef(null);
  const scheduleRef = useRef(null);
  const propertiesRef = useRef(null);
  const buyersRef = useRef(null);

  /* ------------------------------------------------------------------------ */
  /* Toast                                                                    */
  /* ------------------------------------------------------------------------ */

  function showToast(message) {
    setToast(message);

    setTimeout(() => {
      setToast(null);
    }, 2200);
  }

  /* ------------------------------------------------------------------------ */
  /* Scroll                                                                   */
  /* ------------------------------------------------------------------------ */

  function scrollTo(ref) {
    if (!ref.current) return;

    ref.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Search                                                                   */
  /* ------------------------------------------------------------------------ */

  const filteredBuyers = useMemo(() => {
    if (!search.trim()) return buyers;

    const query = search.toLowerCase();

    return buyers.filter(
      (buyer) =>
        buyer.name.toLowerCase().includes(query) ||
        buyer.property.toLowerCase().includes(query)
    );
  }, [buyers, search]);

  const filteredProperties = useMemo(() => {
    if (!search.trim()) return properties;

    const query = search.toLowerCase();

    return properties.filter(
      (property) =>
        property.name.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query)
    );
  }, [properties, search]);

  const filteredActivities = useMemo(() => {
    if (!search.trim()) return activities;

    const query = search.toLowerCase();

    return activities.filter(
      (activity) =>
        activity.title.toLowerCase().includes(query) ||
        activity.subtitle.toLowerCase().includes(query)
    );
  }, [activities, search]);

  const filteredTasks = useMemo(() => {
    if (!search.trim()) return tasks;

    const query = search.toLowerCase();

    return tasks.filter((task) => task.label.toLowerCase().includes(query));
  }, [tasks, search]);

  /* ------------------------------------------------------------------------ */
  /* Task Calculations                                                        */
  /* ------------------------------------------------------------------------ */

  const completedTasks = tasks.filter((task) => task.done).length;

  const progressPct = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  /* ------------------------------------------------------------------------ */
  /* Tasks                                                                    */
  /* ------------------------------------------------------------------------ */

  function toggleTask(index) {
    const task = filteredTasks[index];
    if (!task) return;
    updateTask(task.id, { done: !task.done });
  }

  async function addTask() {
    const value = newTask.trim();

    if (!value) return;

    try {
      await addTaskDoc({ label: value, done: false });
      setNewTask('');
      showToast('Task added successfully!');
    } catch (error) {
      console.error(error);
      showToast('Could not add task');
    }
  }

  function removeTask(index) {
    const task = filteredTasks[index];
    if (!task) return;

    deleteTask(task.id);
    showToast('Task removed');
  }

  /* ------------------------------------------------------------------------ */
  /* Notes                                                                    */
  /* ------------------------------------------------------------------------ */

  async function addNote() {
    const value = noteDraft.trim();

    if (!value) return;

    const now = new Date();

    const formattedTime = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    try {
      await addNoteDoc({ text: value, time: formattedTime });
      setNoteDraft('');
      setShowNoteForm(false);
      showToast('Note added successfully!');
    } catch (error) {
      console.error(error);
      showToast('Could not add note');
    }
  }

  function removeNote(index) {
    const note = notes[index];
    if (!note) return;

    deleteNote(note.id);
    showToast('Note removed');
  }
  /* ------------------------------------------------------------------------ */
  /* Add Property / Client / Deal                                             */
  /* ------------------------------------------------------------------------ */

  async function handleAdd(entry) {
    try {
      if (entry.type === 'property') {
        await addDashboardProperty({
          name: entry.name || '',
          location: entry.location || '',
          price: entry.price || '',
        });

        setActivities((previous) => [
          {
            title: 'New property added',
            subtitle: `${entry.name} in ${entry.location}`,
            time: 'Just now',
            icon: Home,
            color: 'text-blue-600 bg-blue-50',
          },
          ...previous,
        ]);

        showToast('Property added successfully!');
      }

      if (entry.type === 'client') {
        await addDashboardBuyer({
          name: entry.name || '',
          property: entry.property || '',
          date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          amount: entry.amount || '',
        });

        setActivities((previous) => [
          {
            title: 'New client added',
            subtitle: `${entry.name} bought ${entry.property}`,
            time: 'Just now',
            icon: Users,
            color: 'text-emerald-600 bg-emerald-50',
          },
          ...previous,
        ]);

        showToast('Client added successfully!');
      }

      if (entry.type === 'deal') {
        await addDeal({
          name: entry.name || '',
          property: entry.property || '',
          stage: entry.stage,
        });

        setActivities((previous) => [
          {
            title: 'New deal added',
            subtitle: `${entry.name} — ${entry.property}`,
            time: 'Just now',
            icon: Handshake,
            color: 'text-amber-600 bg-amber-50',
          },
          ...previous,
        ]);

        showToast('Deal added successfully!');
      }
    } catch (error) {
      console.error(error);
      showToast('Could not save — please try again');
    }

    setAddType(null);
  }
  /* ------------------------------------------------------------------------ */
  /* Stats                                                                    */
  /* ------------------------------------------------------------------------ */

  const activeDeals = pipeline.reduce((total, item) => total + item.count, 0);

  const statCards = [
    {
      label: 'Total Properties',
      value: properties.length,
      change: 'View All',
      icon: Home,
      bg: 'bg-blue-50',
      fg: 'text-blue-600',
      linkStyle: true,
      onClick: () => scrollTo(propertiesRef),
    },
    {
      label: 'Total Clients',
      value: buyers.length,
      change: 'View All',
      icon: Users,
      bg: 'bg-emerald-50',
      fg: 'text-emerald-600',
      linkStyle: true,
      onClick: () => scrollTo(buyersRef),
    },
    {
      label: 'Active Deals',
      value: activeDeals,
      change: 'View Pipeline',
      icon: Handshake,
      bg: 'bg-amber-50',
      fg: 'text-amber-600',
      linkStyle: true,
      onClick: () => setShowPipelineModal(true),
    },
    {
      label: "Today's Visits",
      value: schedule.length,
      change: 'View Schedule',
      icon: MapPin,
      bg: 'bg-violet-50',
      fg: 'text-violet-600',
      linkStyle: true,
      onClick: () => scrollTo(scheduleRef),
    },
    {
      label: 'Pending Follow-ups',
      value: 0,
      change: 'No follow-ups',
      icon: BellRing,
      bg: 'bg-rose-50',
      fg: 'text-rose-600',
      linkStyle: true,
      onClick: () => setShowActivitiesModal(true),
    },
  ];

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Search */}
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-white border-b border-gray-100">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <input
            type="text"
            placeholder="Search properties, clients, deals, tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
      </div>

      <div className="px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {/* Date */}
            <button
              onClick={() => setShowDateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50"
            >
              <Calendar className="w-4 h-4 text-gray-400" />

              <span>
                {currentDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}

                <span className="block text-[11px] text-gray-400 -mt-0.5">
                  {currentDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                  })}
                </span>
              </span>
            </button>

            {/* Add New */}
            <div className="relative">
              <button
                onClick={() => setAddMenuOpen((previous) => !previous)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add New
                <ChevronDown className="w-4 h-4" />
              </button>

              {addMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setAddMenuOpen(false)}
                  />

                  <div className="absolute right-0 mt-2 z-30 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1.5">
                    <button
                      onClick={() => {
                        setAddType('property');
                        setAddMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Building2 size={15} className="text-blue-600" />
                      Add Property
                    </button>

                    <button
                      onClick={() => {
                        setAddType('client');
                        setAddMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <UserPlus size={15} className="text-emerald-600" />
                      Add Client
                    </button>

                    <button
                      onClick={() => {
                        setAddType('deal');
                        setAddMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Handshake size={15} className="text-amber-600" />
                      Add Deal
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* eslint-disable-next-line react-hooks/refs -- refs are only ever read inside scrollTo(), invoked from onClick, never during render */}
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card
                key={stat.label}
                className="p-4 transition-shadow hover:shadow-md"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}
                >
                  <Icon className={`w-5 h-5 ${stat.fg}`} />
                </div>

                <p className="text-2xl font-bold text-gray-900 mt-3">
                  {stat.value}
                </p>

                <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>

                <button
                  onClick={stat.onClick}
                  className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1"
                >
                  {stat.change}

                  <span>→</span>
                </button>
              </Card>
            );
          })}
        </div>

        {/* Pipeline / Schedule / Notes */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-5"
          ref={pipelineRef}
        >
          {/* Pipeline */}
          <Card className="lg:col-span-1 pb-5">
            <CardHeader
              title="Deal Pipeline"
              action="View All →"
              onAction={() => setShowPipelineModal(true)}
            />

            <div className="px-5 pt-4">
              {pipeline.length === 0 ? (
                <div className="py-8 text-center">
                  <Handshake className="w-8 h-8 mx-auto text-gray-300 mb-2" />

                  <p className="text-sm text-gray-400">
                    No deals in pipeline yet.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 flex-wrap mb-4">
                    {pipeline.map((item) => (
                      <span
                        key={item.name}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-100"
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between relative mb-2">
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-100 -translate-y-1/2" />

                    {pipeline.map((item) => (
                      <div
                        key={item.name}
                        className="relative flex flex-col items-center gap-2 z-10"
                      >
                        <span
                          className={`w-3 h-3 rounded-full ${item.color}`}
                        />

                        <span className="text-sm font-semibold text-gray-700">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <p className="text-xs text-gray-400 mt-4">Pipeline Value</p>

              <p className="text-xl font-bold text-gray-900">PKR 0</p>

              <p className="text-xs text-gray-400 mt-1">
                No pipeline value available yet.
              </p>

              <button
                onClick={() => setShowPipelineModal(true)}
                className="mt-4 w-full text-center py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                View Pipeline Details
              </button>
            </div>
          </Card>

          {/* Schedule */}
          <Card className="pb-5" ref={scheduleRef}>
            <CardHeader
              title="Today's Schedule"
              action="View Calendar"
              onAction={() => setShowDateModal(true)}
            />

            <div className="px-5 pt-4 space-y-4">
              {schedule.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar className="w-8 h-8 mx-auto text-gray-300 mb-2" />

                  <p className="text-sm text-gray-400">
                    No schedule for today.
                  </p>
                </div>
              ) : (
                schedule.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div key={index} className="flex gap-3">
                      <div className="text-right w-14 shrink-0">
                        <p className="text-xs font-semibold text-gray-700">
                          {item.time}
                        </p>

                        <p className="text-[11px] text-gray-400">{item.date}</p>
                      </div>

                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {item.title}
                        </p>

                        <p className="text-xs text-gray-400">{item.subtitle}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Notes */}
          <Card className="pb-5">
            <CardHeader
              title="Quick Notes"
              action="+ New Note"
              onAction={() => setShowNoteForm((previous) => !previous)}
            />

            <div className="px-5 pt-4 space-y-3 max-h-72 overflow-y-auto">
              {showNoteForm && (
                <div className="border border-gray-200 rounded-xl p-3">
                  <textarea
                    className="w-full text-sm outline-none resize-none"
                    rows={3}
                    placeholder="Write a note..."
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                  />

                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => {
                        setShowNoteForm(false);
                        setNoteDraft('');
                      }}
                      className="text-xs px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={addNote}
                      className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              {notes.length === 0 && !showNoteForm ? (
                <div className="py-8 text-center">
                  <FileText className="w-8 h-8 mx-auto text-gray-300 mb-2" />

                  <p className="text-sm text-gray-400">No notes yet.</p>
                </div>
              ) : (
                notes.map((note, index) => (
                  <div
                    key={note.id || index}
                    className="bg-amber-50 border border-amber-100 rounded-xl p-4 relative group"
                  >
                    <button
                      onClick={() => removeNote(index)}
                      className="absolute top-2 right-2 text-amber-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 size={13} />
                    </button>

                    <p className="text-sm text-gray-700 leading-relaxed pr-4">
                      {note.text}
                    </p>

                    <p className="text-[11px] text-gray-400 mt-3">
                      {note.time}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Properties */}
        <Card className="pb-5" ref={propertiesRef}>
          <CardHeader
            title="Available Properties"
            subtitle={`(${filteredProperties.length} listed)`}
          />

          <div className="overflow-x-auto px-5 pt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="py-2 font-medium">Property Name</th>

                  <th className="py-2 font-medium">Location</th>

                  <th className="py-2 font-medium">Price</th>
                </tr>
              </thead>

              <tbody>
                {filteredProperties.map((property) => (
                  <tr
                    key={property.id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="py-2.5 text-gray-800 font-medium">
                      {property.name}
                    </td>

                    <td className="py-2.5 text-gray-500">
                      {property.location}
                    </td>

                    <td className="py-2.5 text-gray-800 font-semibold">
                      {money(property.price)}
                    </td>
                  </tr>
                ))}

                {filteredProperties.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center">
                      <Home className="w-7 h-7 mx-auto text-gray-300 mb-2" />

                      <p className="text-sm text-gray-400">
                        No properties found.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Business Overview / Activities / Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Business Overview */}
          <Card className="lg:col-span-1 pb-5">
            <div className="px-5 pt-5">
              <h3 className="text-[15px] font-semibold text-gray-900">
                Business Overview{' '}
                <span className="text-xs text-gray-400 font-normal">
                  (This Month)
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 px-5 pt-4">
              <div>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mb-2">
                  <ArrowUp className="w-4 h-4 text-emerald-600" />
                </div>

                <p className="text-xs text-gray-400">Total Income</p>

                <p className="text-sm font-bold text-gray-900">PKR 0</p>

                <p className="text-[11px] text-gray-400">No data yet</p>
              </div>

              <div>
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center mb-2">
                  <ArrowDown className="w-4 h-4 text-rose-600" />
                </div>

                <p className="text-xs text-gray-400">Total Expenses</p>

                <p className="text-sm font-bold text-gray-900">PKR 0</p>

                <p className="text-[11px] text-gray-400">No data yet</p>
              </div>

              <div>
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center mb-2">
                  <FileText className="w-4 h-4 text-violet-600" />
                </div>

                <p className="text-xs text-gray-400">Commission Earned</p>

                <p className="text-sm font-bold text-gray-900">PKR 0</p>

                <p className="text-[11px] text-gray-400">No data yet</p>
              </div>
            </div>

            <div className="h-52 flex items-center justify-center px-5">
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto text-gray-300 mb-2" />

                <p className="text-sm text-gray-400">
                  No business data available yet.
                </p>
              </div>
            </div>

            <div className="px-5">
              <button
                onClick={() => showToast('No business data available yet')}
                className="w-full text-center py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                View Full Report
              </button>
            </div>
          </Card>

          {/* Activities */}
          <Card className="pb-5">
            <CardHeader
              title="Recent Activities"
              action="View All"
              onAction={() => setShowActivitiesModal(true)}
            />

            <div className="px-5 pt-4 space-y-4 max-h-80 overflow-y-auto">
              {filteredActivities.length === 0 ? (
                <div className="py-8 text-center">
                  <BellRing className="w-8 h-8 mx-auto text-gray-300 mb-2" />

                  <p className="text-sm text-gray-400">No activities yet.</p>
                </div>
              ) : (
                filteredActivities.map((activity, index) => {
                  const Icon = activity.icon;

                  return (
                    <div key={index} className="flex gap-3 items-start">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activity.color}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {activity.title}
                        </p>

                        <p className="text-xs text-gray-400">
                          {activity.subtitle}
                        </p>
                      </div>

                      <p className="text-[11px] text-gray-400 whitespace-nowrap">
                        {activity.time}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Tasks */}
          <div className="flex flex-col gap-5">
            <Card className="pb-5">
              <CardHeader
                title="Today's Tasks"
                action={`${completedTasks}/${tasks.length} done`}
              />

              <div className="px-5 pt-3 space-y-3">
                {filteredTasks.map((task, index) => (
                  <div
                    key={task.id || index}
                    className="flex items-center gap-2 group"
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(index)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />

                    <span
                      className={`text-sm flex-1 ${
                        task.done
                          ? 'text-gray-400 line-through'
                          : 'text-gray-700'
                      }`}
                    >
                      {task.label}
                    </span>

                    <button
                      onClick={() => removeTask(index)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                {filteredTasks.length === 0 && (
                  <div className="py-5 text-center">
                    <FileCheck className="w-7 h-7 mx-auto text-gray-300 mb-2" />

                    <p className="text-xs text-gray-400">No tasks yet.</p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <input
                    className="flex-1 text-sm border border-gray-200 rounded-md px-2.5 py-1.5 outline-none focus:border-blue-400"
                    placeholder="Add a task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addTask();
                      }
                    }}
                  />

                  <button
                    onClick={addTask}
                    className="text-xs px-2.5 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>

                {tasks.length > 0 && (
                  <div className="pt-1">
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{
                          width: `${progressPct}%`,
                        }}
                      />
                    </div>

                    <p className="text-xs text-gray-400 mt-1">
                      {completedTasks} of {tasks.length} tasks completed
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Clients */}
        <Card className="pb-5" ref={buyersRef}>
          <CardHeader
            title="Clients Who Bought Property"
            action="View All"
            onAction={() => {
              setSearch('');
              scrollTo(buyersRef);

              showToast(`Showing all ${buyers.length} clients`);
            }}
          />

          <div className="overflow-x-auto px-5 pt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="py-2 font-medium">Client Name</th>

                  <th className="py-2 font-medium">Property</th>

                  <th className="py-2 font-medium">Purchase Date</th>

                  <th className="py-2 font-medium">Amount</th>
                </tr>
              </thead>

              <tbody>
                {filteredBuyers.map((buyer, index) => (
                  <tr
                    key={buyer.id || index}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="py-2.5 text-gray-800 font-medium">
                      {buyer.name}
                    </td>

                    <td className="py-2.5 text-gray-500">{buyer.property}</td>

                    <td className="py-2.5 text-gray-500">{buyer.date}</td>

                    <td className="py-2.5 text-gray-800 font-semibold">
                      {money(buyer.amount)}
                    </td>
                  </tr>
                ))}

                {filteredBuyers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center">
                      <Users className="w-7 h-7 mx-auto text-gray-300 mb-2" />

                      <p className="text-sm text-gray-400">No clients found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center px-5 pt-4 flex-wrap gap-2">
            <button
              onClick={() => showToast('No client data available for export')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Download PDF Report
            </button>

            <p className="text-xs text-gray-400">
              Export complete list of clients who bought property.
            </p>
          </div>
        </Card>
      </div>

      {/* Add Modal */}
      {addType && (
        <AddModal
          type={addType}
          pipelineNames={pipeline.map((item) => item.name)}
          onClose={() => setAddType(null)}
          onSave={handleAdd}
        />
      )}

      {/* Date Modal */}
      {showDateModal && (
        <DateModal
          date={currentDate}
          onClose={() => setShowDateModal(false)}
          onSelect={(value) => {
            if (!value) return;

            setCurrentDate(new Date(`${value}T00:00:00`));

            setShowDateModal(false);

            showToast('Date updated');
          }}
        />
      )}

      {/* Pipeline Modal */}
      {showPipelineModal && (
        <PipelineModal
          pipeline={pipeline}
          onClose={() => setShowPipelineModal(false)}
        />
      )}

      {/* Activities Modal */}
      {showActivitiesModal && (
        <ActivitiesModal
          activities={activities}
          onClose={() => setShowActivitiesModal(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
