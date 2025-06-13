import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import SmartPWAPrompt from '@/components/SmartPWAPrompt';

// Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import AnimalList from '@/pages/AnimalList';
import AnimalForm from '@/pages/AnimalForm';
import AnimalDetail from '@/pages/AnimalDetail';
import AnimalEdit from '@/pages/AnimalEdit';
import HealthRecords from '@/pages/HealthRecords';
import Breeding from '@/pages/Breeding';
import Reports from '@/pages/Reports';
import Calendar from '@/pages/Calendar';
import Settings from '@/pages/Settings';
import Lots from '@/pages/Lots';
import Notifications from '@/pages/Notifications';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/animals" element={<ProtectedRoute><AnimalList /></ProtectedRoute>} />
              <Route path="/animals/new" element={<ProtectedRoute><AnimalForm /></ProtectedRoute>} />
              <Route path="/animals/:id" element={<ProtectedRoute><AnimalDetail /></ProtectedRoute>} />
              <Route path="/animals/:id/edit" element={<ProtectedRoute><AnimalEdit /></ProtectedRoute>} />
              <Route path="/health" element={<ProtectedRoute><HealthRecords /></ProtectedRoute>} />
              <Route path="/breeding" element={<ProtectedRoute><Breeding /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/lots" element={<ProtectedRoute><Lots /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              
              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <SmartPWAPrompt />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
