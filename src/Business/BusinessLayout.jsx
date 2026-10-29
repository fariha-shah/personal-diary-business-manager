import { Routes, Route } from "react-router-dom";

import BusinessSidebar from "./BusinessSidebar";
import BusinessDashboard from "./BusinessDashboard";

import PropertiesPage from "./PropertiesPage";
import ClientsPage from "./ClientsPage";
import FollowUpsPage from "./FollowUpsPage";
import PropertyGallery from "./PropertyGallery";

// import PaymentLayout from "./Payment/PaymentLayout";

export default function BusinessLayout() {
  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-0 bg-[#141f3d] overflow-hidden">
      <BusinessSidebar />

      <div className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-5 md:p-6">
        <Routes>
          <Route index element={<BusinessDashboard />} />

          <Route path="properties" element={<PropertiesPage />} />

          <Route path="clients" element={<ClientsPage />} />

          <Route path="followups" element={<FollowUpsPage />} />

          <Route path="gallery" element={<PropertyGallery />} />

          {/* <Route path="payments/*" element={<PaymentLayout />} /> */}
        </Routes>
      </div>
    </div>
  );
}