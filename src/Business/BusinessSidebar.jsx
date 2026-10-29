import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  ClipboardList,
  Images,
} from "lucide-react";

export default function BusinessSidebar() {
  const activeClass =
    "bg-gradient-to-r from-cyan-700 to-teal-600 text-white font-semibold";
  const inactiveClass = "text-gray-300 hover:text-white";

  const mobileActiveClass =
    "bg-gradient-to-r from-cyan-700 to-teal-600 text-white font-semibold shadow-sm";
  const mobileInactiveClass = "text-gray-300 hover:text-white bg-[#1c2a52]";

  const links = [
    { to: "/business", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/business/properties", label: "Properties", icon: Building2, end: false },
    { to: "/business/clients", label: "Clients", icon: Users, end: false },
    { to: "/business/followups", label: "Follow-ups", icon: ClipboardList, end: false },
    { to: "/business/gallery", label: "Gallery", icon: Images, end: false },
  ];

  return (
    <>
      {/* Mobile Top Horizontal Scrollable Tab Bar */}
      <div className="lg:hidden bg-[#24366a] px-3 py-2 border-b border-[#1c2a52] overflow-x-auto flex items-center gap-2 shrink-0">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition shrink-0 ${
                  isActive ? mobileActiveClass : mobileInactiveClass
                }`
              }
            >
              <Icon size={14} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 h-full bg-[#24366a] text-white p-6 flex-col shrink-0 border-r border-[#1c2a52]">
        <div className="mb-6 px-2">
          <p className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400 mb-2">
            Workspace
          </p>
          <h1 className="text-xl font-bold text-white tracking-wide">
            Business
          </h1>
        </div>

        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `w-full rounded-xl flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 ${
                    isActive ? activeClass : inactiveClass
                  }`
                }
              >
                <Icon size={19} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
