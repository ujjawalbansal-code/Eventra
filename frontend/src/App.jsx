import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Discover from "./pages/Discover";
import EventDetails from "./pages/EventDetails";
import BookingFlow from "./pages/BookingFlow";
import MyTickets from "./pages/MyTickets";
import TicketDetail from "./pages/TicketDetail";
import Squads from "./pages/Squads";
import SquadDetail from "./pages/SquadDetail";
import Profile from "./pages/Profile";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import CreateEvent from "./pages/CreateEvent";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/events/:id" element={<EventDetails />} />

        <Route
          path="/events/:id/book"
          element={
            <ProtectedRoute>
              <BookingFlow />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <MyTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute>
              <TicketDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/squads"
          element={
            <ProtectedRoute>
              <Squads />
            </ProtectedRoute>
          }
        />
        <Route
          path="/squads/:id"
          element={
            <ProtectedRoute>
              <SquadDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer"
          element={
            <ProtectedRoute>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/new"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <div className="text-center py-24">
              <p className="font-display font-semibold text-lg text-ink">Page not found</p>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
