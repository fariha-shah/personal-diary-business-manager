import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiPlus, FiBookOpen, FiPenTool, FiChevronLeft } from 'react-icons/fi';

import Card from '../components/common/Card';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';

import EntryList from './components/EntryList';
import Editor from './components/Editor';
import { useDiary } from './hooks/useDiary';

export default function Notes({ entryToOpen = null, onEntryOpened }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileView, setMobileView] = useState('list');
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const { entries, addEntry, updateEntry, deleteEntry } = useDiary();

  const activeEntry =
    entries.find((entry) => entry.id === activeEntryId) || null;

  const pendingEntryId = entryToOpen || location.state?.entryToOpen || null;

  useEffect(() => {
    if (!pendingEntryId || entries.length === 0) return;

    const entryExists = entries.some((entry) => entry.id === pendingEntryId);

    if (!entryExists) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- genuinely syncing with an external system (router navigation state), not derivable during render
    setActiveEntryId(pendingEntryId);
    setMobileView('editor');

    if (onEntryOpened) {
      onEntryOpened();
    }

    if (location.state?.entryToOpen) {
      // Clear the navigation state so refreshing/revisiting this page
      // doesn't keep re-opening the same entry.
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [pendingEntryId, entries, onEntryOpened, location, navigate]);

  const handleSelectEntry = (id) => {
    setActiveEntryId(id);
    setMobileView('editor');
  };

  const handleNewEntry = () => {
    const id = addEntry({});

    setActiveEntryId(id);
    setMobileView('editor');
  };

  const handleDeleteConfirmed = () => {
    if (!deleteTargetId) return;

    deleteEntry(deleteTargetId);

    if (deleteTargetId === activeEntryId) {
      setActiveEntryId(null);
      setMobileView('list');
    }

    setDeleteTargetId(null);
  };

  return (
    // -m-6 cancels MainLayout's p-6 padding and px-8 py-6 re-adds it here —
    // same trick Dashboard.jsx uses so this page gets its own full-bleed
    // light background instead of the dark shell showing through.
    <div className="-m-6 min-h-[calc(100vh-4rem)] bg-gray-50 px-8 py-6 animate-[fadeIn_0.35s_ease-out]">
      {/* Page Header */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <FiPenTool size={19} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Notes</h1>

              <p className="text-sm text-gray-400 mt-0.5">
                Capture your thoughts, memories and everyday moments.
              </p>
            </div>
          </div>
        </div>

        <Button
          icon={FiPlus}
          onClick={handleNewEntry}
          className="
            !bg-purple-500
            hover:!bg-purple-600
            shadow-sm
            hover:shadow-md
          "
        >
          New Entry
        </Button>
      </div>

      {/* Diary */}
      <div className="flex min-h-[calc(100vh-14rem)] gap-4">
        {/* Entry List */}
        <Card
          padding="p-0"
          className={`
            w-full shrink-0 overflow-hidden
            lg:w-80
            ${mobileView === 'list' ? 'flex' : 'hidden lg:flex'}
            flex-col
          `}
        >
          {/* List Header */}
          <div className="border-b border-slate-100 bg-purple-50/60 px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Journal Entries
                </h2>

                <p className="text-xs text-slate-400 mt-0.5">
                  {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-purple-500 shadow-sm">
                <FiBookOpen size={17} />
              </div>
            </div>
          </div>

          {/* Entries */}
          <div className="flex-1 overflow-y-auto">
            <EntryList
              entries={entries}
              activeEntryId={activeEntryId}
              onSelect={handleSelectEntry}
            />
          </div>
        </Card>

        {/* Editor */}
        <Card
          padding="p-0"
          className={`
            flex-1
            overflow-hidden
            ${mobileView === 'editor' ? 'flex' : 'hidden lg:flex'}
            flex-col
          `}
        >
          {/* Mobile back */}
          <button
            type="button"
            onClick={() => setMobileView('list')}
            className="
              flex items-center gap-1
              px-5 pt-4
              text-sm text-slate-400
              hover:text-purple-500
              transition-colors
              lg:hidden
            "
          >
            <FiChevronLeft size={16} />
            Back to entries
          </button>

          <div className="min-h-0 flex-1">
            {activeEntry ? (
             <Editor
                key={activeEntry.id}
                entry={activeEntry}
                onChange={(updates) => updateEntry(activeEntry.id, updates)}
                onDelete={() => setDeleteTargetId(activeEntry.id)}
              />
            ) : (
              <div className="flex h-full items-center justify-center px-6">
                <EmptyState
                  icon={FiPenTool}
                  message="Start writing your story"
                  subMessage="Select an entry from the left or create a new diary entry."
                />
              </div>
            )}
          </div>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirmed}
        title="Delete this entry?"
        message="This diary entry will be permanently removed."
      />
    </div>
  );
}
