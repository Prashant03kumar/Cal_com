import React, { useEffect, useState } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/admin/Dashboard";
import EventTypeNew from "./pages/admin/EventTypeNew";
import EventTypeEdit from "./pages/admin/EventTypeEdit";
import Availability from "./pages/admin/Availability";
import Bookings from "./pages/admin/Bookings";
import BookingPage from "./pages/public/BookingPage";
import BookingConfirm from "./pages/public/BookingConfirm";
import NotFound from "./pages/NotFound";

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);

  return (
    <div className="h-screen flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-y-auto bg-gray-50 md:ml-60">
        <div className="md:hidden px-4 py-3 border-b border-gray-200 bg-white">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700"
          >
            ☰
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/event-types/new" element={<EventTypeNew />} />
        <Route path="/event-types/:id/edit" element={<EventTypeEdit />} />
        <Route path="/availability" element={<Availability />} />
        <Route path="/bookings" element={<Bookings />} />
      </Route>

      <Route path="/book/:slug" element={<BookingPage />} />
      <Route path="/book/:slug/confirm" element={<BookingConfirm />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
