import { Routes, Route, Outlet } from 'react-router-dom';

import SideBar from './DashBoard/SideBar';
import Navbar from './Navbar/Navbar';

import Dashboard from './DashBoard/DashBoard';
import AllPayments from './Payment/AllPayments';
import AddPaymentContent from './Payment/AddPayment';
import ReceivedPayments from './Payment/ReceivedPayments';
import PendingPayments from './Payment/PendingPayments';
import OverdueReminders from './Payment/OverdueReminders';
import PaymentMethods from './Payment/PaymentMethods';
import LoanDetail from './Payment/LoanDetail';

import BusinessLayout from './Business/BusinessLayout';
import Setting from './DashBoard/Setting';

import Notes from './Notes/Notes';
import PersonalExpenses from './PersonalExpenses/PersonalExpenses';
import Calculator from './Calculators/Calculator';

import CalendarPage from './calendar/CalendarPage';

import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicOnlyRoute from './components/auth/PublicOnlyRoute';

// Navbar + Sidebar shell — only ever rendered once the user is
// authenticated (see ProtectedShell below).
function ProtectedShell() {
  return (
    <div className="h-screen bg-[#24366a] flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <Navbar />
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}

function MainLayout() {
  return (
    <div className="flex flex-1 min-h-0 bg-[#24366a] overflow-hidden">
      <SideBar />

      <main className="flex-1 bg-[#141f3d] p-3 sm:p-5 md:p-6 overflow-y-auto w-full min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Public route — logged-in users get bounced to "/" automatically */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Everything below requires a logged-in user */}
      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedShell />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />

            <Route path="/payment" element={<AllPayments />} />

            <Route path="/payment/add" element={<AddPaymentContent />} />

            <Route path="/payment/received" element={<ReceivedPayments />} />

            <Route path="/payment/pending" element={<PendingPayments />} />

            <Route path="/payment/overdue" element={<OverdueReminders />} />

            <Route path="/payment/methods" element={<PaymentMethods />} />

            <Route path="/payment/loan-detail" element={<LoanDetail />} />

            <Route path="/setting" element={<Setting />} />

            <Route path="/settings" element={<Setting />} />

            <Route path="/notes" element={<Notes />} />

            <Route path="/personal-expenses" element={<PersonalExpenses />} />

            {/* Calculator */}
            <Route path="/calculator" element={<Calculator />} />

            {/* Calendar */}
            <Route path="/calendar" element={<CalendarPage />} />
          </Route>

          <Route path="/business/*" element={<BusinessLayout />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
