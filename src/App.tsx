
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AnimalList from "./pages/AnimalList";
import AnimalForm from "./pages/AnimalForm";
import AnimalDetail from "./pages/AnimalDetail";
import AnimalEdit from "./pages/AnimalEdit";
import HealthRecords from "./pages/HealthRecords";
import Breeding from "./pages/Breeding";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Navigation from "./components/Navigation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="relative">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/animals" element={
                <ProtectedRoute>
                  <AnimalList />
                </ProtectedRoute>
              } />
              <Route path="/animals/new" element={
                <ProtectedRoute>
                  <AnimalForm />
                </ProtectedRoute>
              } />
              <Route path="/animals/:id" element={
                <ProtectedRoute>
                  <AnimalDetail />
                </ProtectedRoute>
              } />
              <Route path="/animals/:id/edit" element={
                <ProtectedRoute>
                  <AnimalEdit />
                </ProtectedRoute>
              } />
              <Route path="/breeding" element={
                <ProtectedRoute>
                  <Breeding />
                </ProtectedRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Navigation />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
