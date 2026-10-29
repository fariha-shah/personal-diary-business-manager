import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { CreditCard, ChevronRight, Trash2 } from 'lucide-react';

const INITIAL_PAYMENT_MENUS = [
  {
    id: 1,
    name: 'All Payments',
    path: '/business/payments/all-payments',
  },
  {
    id: 2,
    name: 'Add Payment',
    path: '/business/payments/add-payment',
  },
  {
    id: 3,
    name: 'Received Payments',
    path: '/business/payments/received-payments',
  },
  {
    id: 4,
    name: 'Pending Payments',
    path: '/business/payments/pending-payments',
  },
  {
    id: 5,
    name: 'Overdue & Reminders',
    path: '/business/payments/overdue-reminders',
  },
  {
    id: 6,
    name: 'Payment Methods',
    path: '/business/payments/payment-methods',
  },
  {
    id: 7,
    name: 'Loan Detail',
    path: '/business/payments/loan-detail',
  },
];

export default function PaymentSidebar() {
  const [paymentMenus, setPaymentMenus] = useState(INITIAL_PAYMENT_MENUS);

  const handleDelete = (id) => {
    const menu = paymentMenus.find((item) => item.id === id);

    if (!menu) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${menu.name}"?`
    );

    if (!confirmed) return;

    setPaymentMenus((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <aside className="flex min-h-screen w-64 flex-col justify-between bg-[#0f172a] p-5 text-white">
      <div>
        <div className="mb-8 flex items-center gap-2">
          <CreditCard size={22} />
          <h2 className="text-xl font-bold">Payments</h2>
        </div>

        <nav className="space-y-2">
          {paymentMenus.map((item) => (
            <div key={item.id} className="group flex items-center gap-1">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-1 items-center justify-between rounded-lg px-4 py-3 transition ${
                    isActive
                      ? 'bg-[#f4a825] font-semibold text-[#0f172a]'
                      : 'text-gray-200 hover:bg-slate-700'
                  }`
                }
              >
                <span>{item.name}</span>
                <ChevronRight size={16} />
              </NavLink>

              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                title={`Delete ${item.name}`}
                className="rounded-lg p-3 text-slate-400 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
