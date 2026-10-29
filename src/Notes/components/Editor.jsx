import { useState, useEffect, useRef } from 'react';
import {
  FiTrash2,
  FiCheck,
  FiSmile,
  FiMeh,
  FiFrown,
  FiHeart,
} from 'react-icons/fi';
import { format, parseISO } from 'date-fns';

const moods = [
  {
    label: 'Great',
    icon: FiSmile,
    active: 'bg-emerald-100 text-emerald-600',
  },
  {
    label: 'Okay',
    icon: FiMeh,
    active: 'bg-blue-100 text-blue-600',
  },
  {
    label: 'Low',
    icon: FiFrown,
    active: 'bg-amber-100 text-amber-600',
  },
];

export default function Editor({ entry, onChange, onDelete }) {
 const [title, setTitle] = useState(entry.title || '');
  const [content, setContent] = useState(entry.content || '');
  const [saved, setSaved] = useState(true);
  const [mood, setMood] = useState(null);

  const debounceRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- debounced autosave: must mark dirty immediately, then save+mark-clean after the timeout
    setSaved(false);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onChange({
        title,
        content,
      });

      setSaved(true);
    }, 600);

    return () => {
      clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally excluding onChange: it's a new function reference every parent render, and including it would restart the debounce timer on every keystroke instead of only on title/content changes
  }, [title, content]);

 const wordCount = (content || '').trim() ? content.trim().split(/\s+/).length : 0;
 
  return (
    <div className="flex h-full flex-col">
      {/* Editor Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div>
          <p className="text-xs text-slate-400">
            {format(parseISO(entry.date), 'EEEE, MMMM d, yyyy')}
          </p>

          <div className="mt-1 flex items-center gap-1.5">
            {saved ? (
              <>
                <FiCheck size={12} className="text-emerald-500" />

                <span className="text-xs text-emerald-500">Saved</span>
              </>
            ) : (
              <span className="text-xs text-slate-400">Saving...</span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onDelete}
          title="Delete entry"
          className="
            flex h-9 w-9
            items-center justify-center
            rounded-lg
            text-slate-300
            hover:bg-red-50
            hover:text-red-500
            transition-all
          "
        >
          <FiTrash2 size={16} />
        </button>
      </div>

      {/* Journal Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Title */}
        <div className="px-6 pt-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your day a title..."
            className="
              w-full
              bg-transparent
              text-2xl
              sm:text-3xl
              font-semibold
              text-slate-800
              placeholder:text-slate-300
              outline-none
            "
          />
        </div>

        {/* Mood */}
        <div className="px-6 pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <FiHeart size={13} />
              How are you feeling?
            </span>

            {moods.map((item) => {
              const Icon = item.icon;
              const isActive = mood === item.label;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setMood(item.label)}
                  className={`
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                    transition-all
                    ${
                      isActive
                        ? item.active
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }
                  `}
                >
                  <Icon size={13} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 my-5 border-t border-slate-100" />

        {/* Writing Area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write about your day..."
          className="
            min-h-[300px]
            w-full
            resize-none
            bg-transparent
            px-6
            pb-8
            text-sm
            leading-7
            text-slate-600
            placeholder:text-slate-300
            outline-none
          "
        />
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3">
        <p className="text-xs text-slate-400">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </p>

        <p className="text-xs text-slate-400">Autosave enabled</p>
      </div>
    </div>
  );
}
