import {
  Home,
  BriefcaseBusiness,
  Wallet,
  Calculator,
  Calendar,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

function SideBar() {
  const location = useLocation();

  const activeClass =
    'bg-gradient-to-r from-cyan-700 to-teal-600 text-white font-semibold';

  const inactiveClass = 'text-gray-300 hover:text-white hover:bg-white/5';

  const isBusinessActive = location.pathname.startsWith('/business');
  const isPersonalActive = location.pathname.startsWith('/personal-expenses');

  return (
    <aside className="hidden lg:flex w-64 xl:w-72 h-full bg-[#24366a] text-white flex-col overflow-hidden shrink-0 border-r border-[#1c2a52]">
      {/* ================= MAIN SIDEBAR CONTENT ================= */}
      <div className="flex-1 overflow-y-auto px-2 py-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {/* ================= OVERVIEW ================= */}
        <div className="px-4">
          <p className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400 mb-4 px-2">
            Overview
          </p>

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `w-full rounded-xl flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                isActive ? activeClass : inactiveClass
              }`
            }
          >
            <Home size={20} />
            <span>Dashboard</span>
          </NavLink>
        </div>

        {/* ================= WORKSPACES ================= */}
        <div className="px-4 mt-8">
          <p className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400 mb-4 px-2">
            Workspaces
          </p>

          <div className="space-y-2">
            {/* Business */}
            <NavLink
              to="/business"
              className={`w-full rounded-xl px-4 py-3 flex justify-between items-center text-sm transition-all duration-200 ${
                isBusinessActive ? activeClass : inactiveClass
              }`}
            >
              <div className="flex items-center gap-3">
                <BriefcaseBusiness size={20} />
                <span>Business</span>
              </div>

              <ChevronDown
                size={18}
                className={`transition-transform duration-200 ${
                  isBusinessActive ? 'rotate-180' : ''
                }`}
              />
            </NavLink>

            {/* Personal Expenses */}
            <NavLink
              to="/personal-expenses"
              className={`w-full rounded-xl flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                isPersonalActive ? activeClass : inactiveClass
              }`}
            >
              <Wallet size={20} />
              <span>Personal Expenses</span>
            </NavLink>
          </div>
        </div>

        {/* ================= TOOLS ================= */}
        <div className="px-4 mt-8">
          <p className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400 mb-4 px-2">
            Tools
          </p>

          <div className="space-y-2">
            {/* Calculator */}
            <NavLink
              to="/calculator"
              className={({ isActive }) =>
                `w-full rounded-xl flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                  isActive ? activeClass : inactiveClass
                }`
              }
            >
              <Calculator size={20} />
              <span>Calculator</span>
            </NavLink>

            {/* Calendar */}
            <NavLink
              to="/calendar"
              className={({ isActive }) =>
                `w-full rounded-xl flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                  isActive ? activeClass : inactiveClass
                }`
              }
            >
              <Calendar size={20} />
              <span>Calendar</span>
            </NavLink>

            {/* Settings */}
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `w-full rounded-xl flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                  isActive ? activeClass : inactiveClass
                }`
              }
            >
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </div>
        </div>

        {/* Extra bottom spacing for scrolling */}
        <div className="h-8" />
      </div>

      {/* ================= USER PROFILE ================= */}
      <div className="shrink-0 border-t border-[#1c2a52] px-6 py-4 bg-[#24366a]">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-tr from-cyan-700 to-teal-600 flex items-center justify-center font-bold text-white text-sm">
            RZ
          </div>

          {/* User Info */}
          <div className="min-w-0">
            <h3 className="font-semibold text-sm leading-tight text-white truncate">
              Rana Zahid Hussain
            </h3>

            <p className="text-gray-400 text-xs mt-0.5">Property Dealer</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default SideBar;
