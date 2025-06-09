import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HeaderWithDropdown from "./components/HeaderWithDropdown";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AnimalList from "./pages/AnimalList";
import AnimalDetail from "./pages/AnimalDetail";
import AnimalForm from "./pages/AnimalForm";
import AnimalEdit from "./pages/AnimalEdit";
import Breeding from "./pages/Breeding";
import Calendar from "./pages/Calendar";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import HealthRecords from "./pages/HealthRecords";
import Lots from "./pages/Lots";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <HeaderWithDropdown />
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/animals" element={
                  <ProtectedRoute>
                    <HeaderWithDropdown />
                    <AnimalList />
                  </ProtectedRoute>
                } />
                <Route path="/animals/new" element={
                  <ProtectedRoute>
                    <HeaderWithDropdown />
                    <AnimalForm />
                  </ProtectedRoute>
                } />
                <Route path="/animals/:id" element={
                  <ProtectedRoute>
                    <HeaderWithDropdown />
                    <AnimalDetail />
                  </ProtectedRoute>
                } />
                <Route path="/animals/:id/edit" element={
                  <ProtectedRoute>
                    <HeaderWithDropdown />
                    <AnimalEdit />
                  </ProtectedRoute>
                } />
                <Route path="/lots" element={
                  <ProtectedRoute>
                    <HeaderWithDropdown />
                    <Lots />
                  </ProtectedRoute>
                } />
                <Route path="/breeding" element={
                  <ProtectedRoute>
                    <HeaderWithDropdown />
                    <Breeding />
                  </ProtectedRoute>
                } />
                <Route path="/calendar" element={
                  <ProtectedRoute>
                    <HeaderWithDropdown />
                    <Calendar />
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <HeaderWithDropdown />
                    <Reports />
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <HeaderWithDropdown />
                    <Notifications />
                  </ProtectedRoute>
                } />
                <Route path="/health-records" element={
                  <ProtectedRoute>
                    <HeaderWithDropdown />
                    <HealthRecords />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <HeaderWithDropdown />
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
