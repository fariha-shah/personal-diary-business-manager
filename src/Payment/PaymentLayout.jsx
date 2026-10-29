import { Routes, Route, Navigate } from "react-router-dom";

import PaymentSidebar from "./PaymentSidebar";

import AllPayments from "./AllPayments";
import AddPayment from "./AddPayment";
import ReceivedPayments from "./ReceivedPayments";
import PendingPayments from "./PendingPayments";
import OverdueReminders from "./OverdueReminders";
import PaymentMethods from "./PaymentMethods";
import LoanDetail from "./LoanDetail";

export default function PaymentLayout() {
  return (
    <div className="flex min-h-screen">
      <PaymentSidebar />

      <div className="flex-1">
        <Routes>
          <Route index element={<Navigate to="all-payments" replace />} />

          <Route path="all-payments" element={<AllPayments />} />
          <Route path="add-payment" element={<AddPayment />} />
          <Route path="received-payments" element={<ReceivedPayments />} />
          <Route path="pending-payments" element={<PendingPayments />} />
          <Route path="overdue-reminders" element={<OverdueReminders />} />
          <Route path="payment-methods" element={<PaymentMethods />} />
          <Route path="loan-detail" element={<LoanDetail />} />
        </Routes>
      </div>
    </div>
  );
}