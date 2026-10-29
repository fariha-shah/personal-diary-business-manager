import { useState } from 'react';
import {
  User,
  Palette,
  Bell,
  Shield,
  Sun,
  Moon,
  Laptop,
  BookOpen,
  LogOut,
  CheckCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from './hooks/useSettings';

export default function Setting() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { settings, saveSettings, isLoading } = useSettings();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="w-full h-full max-w-4xl mx-auto flex items-center justify-center text-sm text-gray-400">
        Loading settings…
      </div>
    );
  }

  // SettingsForm only ever mounts here, once settings has real data —
  // so its useState initial values are correct from the start, and we
  // never need an effect to "sync in" data that arrived after mount.
  return (
    <SettingsForm
      settings={settings}
      saveSettings={saveSettings}
      handleLogout={handleLogout}
    />
  );
}

function SettingsForm({ settings, saveSettings, handleLogout }) {
  const [settingsTab, setSettingsTab] = useState('profile');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [profile, setProfile] = useState(settings.profile);
  const [theme, setTheme] = useState(settings.theme);
  const [notifications, setNotifications] = useState(settings.notifications);
  const [security, setSecurity] = useState(settings.security);

  const settingsTabs = [
    { id: 'profile', label: 'Profile & Account', icon: User },
    { id: 'diary', label: 'Diary Preferences', icon: BookOpen },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Reminders & Alerts', icon: Bell },
    { id: 'security', label: 'Privacy & Passcode', icon: Shield },
  ];

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      await saveSettings({ profile, theme, notifications, security });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert('Could not save settings.');
    }
  };

  return (
    <div className="w-full h-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden select-none">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
          <p className="text-xs text-gray-400">
            Manage your personal diary preferences and account security
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold animate-in fade-in duration-200">
            <CheckCircle size={15} />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-60 border-r border-gray-100 p-4 flex flex-col justify-between bg-gray-50/50 shrink-0">
          <div className="space-y-1">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              const active = settingsTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSettingsTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    active
                      ? 'bg-white text-cyan-700 shadow-sm border border-gray-200/60 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-gray-200/60">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form
          id="settings-form"
          onSubmit={handleSave}
          className="flex-1 p-6 overflow-y-auto space-y-6"
        >
          {/* Profile Tab */}
          {settingsTab === 'profile' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b pb-2">
                Profile Details
              </h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-cyan-600 transition"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-cyan-600 transition"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  placeholder="user@example.com"
                  required
                />
              </div>
            </div>
          )}

          {/* Diary Preferences Tab */}
          {settingsTab === 'diary' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b pb-2">
                Diary Preferences
              </h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Diary Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-cyan-600 transition"
                  value={profile.diaryTitle}
                  onChange={(e) =>
                    setProfile({ ...profile, diaryTitle: e.target.value })
                  }
                  placeholder="e.g. My Secret Journal"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Default Layout View
                </label>
                <select
                  value={profile.defaultView}
                  onChange={(e) =>
                    setProfile({ ...profile, defaultView: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-cyan-600 bg-white"
                >
                  <option value="grid">Grid View</option>
                  <option value="list">List View</option>
                </select>
              </div>

              <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition">
                <div>
                  <p className="text-xs font-medium text-gray-800">
                    Auto-Save Drafts
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Automatically save entries while typing
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.autoSave}
                  onChange={(e) =>
                    setProfile({ ...profile, autoSave: e.target.checked })
                  }
                  className="w-4 h-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500 cursor-pointer"
                />
              </label>
            </div>
          )}

          {/* Appearance Tab */}
          {settingsTab === 'appearance' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b pb-2">
                Theme Mode
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'light', label: 'Light', icon: Sun },
                  { key: 'dark', label: 'Dark', icon: Moon },
                  { key: 'system', label: 'System', icon: Laptop },
                ].map((t) => {
                  const Icon = t.icon;
                  const isSelected = theme === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTheme(t.key)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-xs font-medium transition ${
                        isSelected
                          ? 'border-cyan-600 bg-cyan-50/50 text-cyan-700 shadow-sm'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reminders Tab */}
          {settingsTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b pb-2">
                Reminders & Notifications
              </h3>

              <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition">
                <div>
                  <p className="text-xs font-medium text-gray-800">
                    Daily Writing Reminder
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Receive a prompt notification to write your diary entry
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.dailyReminder}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      dailyReminder: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500 cursor-pointer"
                />
              </label>

              {notifications.dailyReminder && (
                <div className="pl-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Reminder Time
                  </label>
                  <input
                    type="time"
                    value={notifications.reminderTime}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        reminderTime: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-cyan-600"
                  />
                </div>
              )}

              <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition">
                <div>
                  <p className="text-xs font-medium text-gray-800">
                    Email Digest Alerts
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Receive weekly payment summaries and notes digest
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailAlerts}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      emailAlerts: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500 cursor-pointer"
                />
              </label>
            </div>
          )}

          {/* Privacy & Passcode Tab */}
          {settingsTab === 'security' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b pb-2">
                Privacy & Passcode Lock
              </h3>

              <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition">
                <div>
                  <p className="text-xs font-medium text-gray-800">
                    Enable PIN Passcode
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Require a 4-digit PIN when opening your diary
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={security.enablePasscode}
                  onChange={(e) =>
                    setSecurity({
                      ...security,
                      enablePasscode: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500 cursor-pointer"
                />
              </label>

              {security.enablePasscode && (
                <div className="space-y-3 pl-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Set 4-Digit PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={security.passcode}
                      onChange={(e) =>
                        setSecurity({ ...security, passcode: e.target.value })
                      }
                      placeholder="****"
                      className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-cyan-600 tracking-widest text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Auto-Lock Timer
                    </label>
                    <select
                      value={security.autoLock}
                      onChange={(e) =>
                        setSecurity({ ...security, autoLock: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-cyan-600 bg-white"
                    >
                      <option value="5">After 5 minutes</option>
                      <option value="15">After 15 minutes</option>
                      <option value="30">After 30 minutes</option>
                      <option value="immediately">Immediately on exit</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-3 border-t border-gray-100 bg-gray-50/50">
        <button
          type="submit"
          form="settings-form"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-700 to-teal-600 text-xs font-semibold text-white shadow-md hover:opacity-95 transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}