import { useEffect, useMemo, useRef, useState } from 'react';
import { usePayments } from '../Payment/hooks/usePayments';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Wallet,
  NotebookPen,
  Bell,
  BookMarked,
  X,
  CheckCheck,
  Menu,
  BriefcaseBusiness,
  Calculator,
  Calendar,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDemo, logout } = useAuth();

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { payments } = usePayments();

  // Close mobile menu whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Locally tracked read/dismissed state (not persisted — refreshing
  // resets which notifications are marked read, which is fine for now
  // since these are always regenerated live from overdue payments).
  const [readIds, setReadIds] = useState(() => new Set());
  const [dismissedIds, setDismissedIds] = useState(() => new Set());

  const notifications = useMemo(() => {
    return payments
      .filter((p) => p.status === 'Overdue' && !dismissedIds.has(p.id))
      .map((p) => ({
        id: p.id,
        title: 'Payment overdue',
        desc: `${p.client || 'A client'}'s payment${
          p.property ? ` for ${p.property}` : ''
        } is overdue.`,
        read: readIds.has(p.id),
      }));
  }, [payments, readIds, dismissedIds]);

  const paymentRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const isHomeActive = location.pathname === '/';
  const isPaymentActive =
    paymentOpen || location.pathname.startsWith('/payment');
  const isNotesActive = location.pathname.startsWith('/notes');

  const activeBtnClass =
    'bg-gradient-to-r from-cyan-700 to-teal-600 text-white shadow-md font-semibold';

  const inactiveBtnClass = 'bg-[#24385B] text-white hover:bg-[#30486d]';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paymentRef.current && !paymentRef.current.contains(event.target)) {
        setPaymentOpen(false);
      }

      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setPaymentOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

 const markAllAsRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  const toggleSingleRead = (id) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const deleteNotification = (id, event) => {
    event.stopPropagation();
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  const clearAllNotifications = () => {
    setDismissedIds(new Set(notifications.map((n) => n.id)));
  };

  const paymentItems = [
    {
      label: 'All Payments',
      path: '/payment',
    },
    {
      label: 'Received Payments',
      path: '/payment/received',
    },
    {
      label: 'Pending Payments',
      path: '/payment/pending',
    },
    {
      label: 'Overdue Reminder',
      path: '/payment/overdue',
    },
    {
      label: 'Payment Methods',
      path: '/payment/methods',
    },
    {
      label: 'Loan Detail',
      path: '/payment/loan-detail',
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="w-full relative z-40 select-none">
      <header className="w-full bg-[#24366a] px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-lg">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 cursor-pointer">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-r from-cyan-700 to-teal-600 flex items-center justify-center shadow-md shrink-0">
            <BookMarked className="text-white" size={22} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-white text-sm sm:text-base md:text-lg font-bold leading-tight truncate">
                Rana Zahid Hussain
              </h2>
              {isDemo && (
                <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-[#141f3d] text-[10px] font-extrabold uppercase">
                  <Sparkles size={10} /> Demo
                </span>
              )}
            </div>

            <p className="text-gray-300 text-[10px] sm:text-xs">Personal Diary & Business</p>
          </div>
        </Link>

        {/* Desktop Main Navigation */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-4">
          {/* Home */}
          <Link
            to="/"
            className={`px-4 lg:px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition ${
              isHomeActive ? activeBtnClass : inactiveBtnClass
            }`}
          >
            <Home size={18} />
            Home
          </Link>

          {/* Payments */}
          <div className="relative" ref={paymentRef}>
            <button
              type="button"
              onClick={() => {
                setPaymentOpen((prev) => !prev);
                setNotificationsOpen(false);
              }}
              className={`px-4 lg:px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition cursor-pointer ${
                isPaymentActive ? activeBtnClass : inactiveBtnClass
              }`}
            >
              <Wallet size={18} />
              Payments
            </button>

            {paymentOpen && (
              <div className="absolute top-12 left-0 w-56 bg-white rounded-xl shadow-xl p-2 border border-gray-100 z-50">
                {paymentItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setPaymentOpen(false)}
                    className="block px-3 py-2 text-xs text-gray-700 font-medium rounded-lg hover:bg-slate-100 transition"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <Link
            to="/notes"
            className={`px-4 lg:px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition ${
              isNotesActive ? activeBtnClass : inactiveBtnClass
            }`}
          >
            <NotebookPen size={18} />
            Notes
          </Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((prev) => !prev);
                setPaymentOpen(false);
              }}
              className="p-2 text-gray-200 hover:text-white rounded-full hover:bg-white/10 transition relative focus:outline-none cursor-pointer"
              aria-label="Open notifications"
            >
              <Bell size={20} className="sm:w-[22px] sm:h-[22px]" />

              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-cyan-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute top-12 right-0 w-[calc(100vw-1.5rem)] max-w-xs sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                {/* Notification Header */}
                <div className="px-4 py-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800">
                    Notifications
                    {unreadCount > 0 && ` (${unreadCount} unread)`}
                  </span>

                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="text-[11px] font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck size={14} />
                        Read all
                      </button>
                    )}

                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={clearAllNotifications}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Notification List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell size={26} className="mx-auto text-gray-300 mb-2" />

                      <p className="text-sm font-medium text-gray-500">
                        No notifications
                      </p>

                      <p className="text-[11px] text-gray-400 mt-1">
                        You're all caught up.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => toggleSingleRead(notification.id)}
                        className={`p-3 transition cursor-pointer flex items-start justify-between gap-2 group ${
                          !notification.read
                            ? 'bg-cyan-50/40 hover:bg-cyan-50/70'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            {!notification.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 shrink-0" />
                            )}

                            <p
                              className={`text-xs ${
                                !notification.read
                                  ? 'font-bold text-gray-900'
                                  : 'font-medium text-gray-600'
                              }`}
                            >
                              {notification.title}
                            </p>
                          </div>

                          <p className="text-[11px] text-gray-500 mt-0.5 leading-tight pl-3">
                            {notification.desc}
                          </p>

                          <span className="text-[10px] text-gray-400 mt-1 block pl-3">
                            {notification.time}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(event) =>
                            deleteNotification(notification.id, event)
                          }
                          className="text-gray-300 hover:text-rose-500 p-1 rounded-md transition opacity-0 group-hover:opacity-100"
                          title="Remove notification"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Badge */}
          <div className="flex items-center gap-2 sm:gap-3 p-1 text-left cursor-default">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-cyan-700 to-teal-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-inner shrink-0">
              RZ
            </div>

            <div className="hidden sm:block">
              <h3 className="text-white text-xs font-semibold leading-tight">
                Rana Zahid
              </h3>

              <p className="text-gray-300 text-[11px]">
                {isDemo ? 'Recruiter Demo' : 'Property Dealer'}
              </p>
            </div>
          </div>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-down Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#18254c] border-b border-[#2e4073] px-4 py-4 space-y-4 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
          {isDemo && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles size={14} /> Recruiter Demo Mode
              </span>
              <span className="text-[10px] text-amber-200/80">Interactive</span>
            </div>
          )}

          {/* Core Navigation */}
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2 px-1">
              Main Menu
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#24366a] text-white text-xs font-medium hover:bg-cyan-700 transition"
              >
                <Home size={16} className="text-cyan-400" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/notes"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#24366a] text-white text-xs font-medium hover:bg-cyan-700 transition"
              >
                <NotebookPen size={16} className="text-cyan-400" />
                <span>Notes & Diary</span>
              </Link>
              <Link
                to="/payment"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#24366a] text-white text-xs font-medium hover:bg-cyan-700 transition"
              >
                <Wallet size={16} className="text-cyan-400" />
                <span>Payments</span>
              </Link>
              <Link
                to="/personal-expenses"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#24366a] text-white text-xs font-medium hover:bg-cyan-700 transition"
              >
                <Wallet size={16} className="text-cyan-400" />
                <span>Expenses & Loans</span>
              </Link>
            </div>
          </div>

          {/* Workspaces & Tools */}
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2 px-1">
              Workspaces & Tools
            </p>
            <div className="space-y-1">
              <Link
                to="/business"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-[#24366a] text-xs font-medium transition"
              >
                <BriefcaseBusiness size={16} className="text-cyan-400" />
                <span>Business Hub (Properties, Clients, Deals)</span>
              </Link>
              <Link
                to="/calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-[#24366a] text-xs font-medium transition"
              >
                <Calculator size={16} className="text-cyan-400" />
                <span>Business & Loan Calculator</span>
              </Link>
              <Link
                to="/calendar"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-[#24366a] text-xs font-medium transition"
              >
                <Calendar size={16} className="text-cyan-400" />
                <span>Calendar & Reminders</span>
              </Link>
              <Link
                to="/setting"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-[#24366a] text-xs font-medium transition"
              >
                <Settings size={16} className="text-cyan-400" />
                <span>Profile & Settings</span>
              </Link>
            </div>
          </div>

          {/* Logout */}
          <div className="pt-2 border-t border-[#2e4073]">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition cursor-pointer"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
