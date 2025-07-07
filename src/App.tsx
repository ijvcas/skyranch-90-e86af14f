
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProtectedFarmRoute from '@/components/ProtectedFarmRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import AnimalList from '@/pages/AnimalList';
import AnimalDetail from '@/pages/AnimalDetail';
import AnimalEdit from '@/pages/AnimalEdit';
import AnimalForm from '@/pages/AnimalForm';
import Breeding from '@/pages/Breeding';
import Calendar from '@/pages/Calendar';
import GmailCallback from '@/pages/GmailCallback';
import Reports from '@/pages/Reports';
import Lots from '@/pages/Lots';
import Notifications from '@/pages/Notifications';
import Settings from '@/pages/Settings';
import HealthRecords from '@/pages/HealthRecords';
import Welcome from '@/pages/Welcome';
import SetupFarm from '@/pages/SetupFarm';
import JoinFarm from '@/pages/JoinFarm';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/setup-farm" element={<SetupFarm />} />
              <Route path="/join-farm" element={<JoinFarm />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/gmail/callback" element={<GmailCallback />} />
              
              <Route path="/" element={
                <ProtectedFarmRoute>
                  <ProtectedRoute useCustomLayout={true}>
                    <Dashboard />
                  </ProtectedRoute>
                </ProtectedFarmRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedFarmRoute>
                  <ProtectedRoute useCustomLayout={true}>
                    <Dashboard />
                  </ProtectedRoute>
                </ProtectedFarmRoute>
              } />
              <Route path="/animals" element={
                <ProtectedFarmRoute>
                  <ProtectedRoute>
                    <AnimalList />
                  </ProtectedRoute>
                </ProtectedFarmRoute>
              } />
              <Route path="/animals/:id" element={
                <ProtectedFarmRoute>
                  <ProtectedRoute>
                    <AnimalDetail />
                  </ProtectedRoute>
                </ProtectedFarmRoute>
              } />
              <Route path="/animals/:id/edit" element={
                <ProtectedFarmRoute>
                  <ProtectedRoute>
                    <AnimalEdit />
                  </ProtectedRoute>
                </ProtectedFarmRoute>
              } />
              <Route path="/animals/new" element={
                <ProtectedFarmRoute>
                  <ProtectedRoute>
                    <AnimalForm />
                  </ProtectedRoute>
                </ProtectedFarmRoute>
              } />
              <Route path="/breeding" element={
                <ProtectedFarmRoute>
                  <ProtectedRoute>
                    <Breeding />
                  </ProtectedRoute>
                </ProtectedFarmRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedFarmRoute>
                  <ProtectedRoute>
                    <Calendar />
                  </ProtectedRoute>
                </ProtectedFarmRoute>
              } />
              <Route path="/reports" element={
                <ProtectedFarmRoute>
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                </ProtectedFarmRoute>
              } />
              <Route path="/lots" element={
                <ProtectedFarmRoute>
                  <ProtectedRoute>
                    <Lots />
                  </ProtectedRoute>
                </ProtectedFarmRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedFarmRoute>
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                </ProtectedFarmRoute>
              } />
              <Route path="/settings" element={
                <ProtectedFarmRoute>
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                </ProtectedFarmRoute>
              } />
              <Route path="/health-records" element={
                <ProtectedFarmRoute>
                  <ProtectedRoute>
                    <HealthRecords />
                  </ProtectedRoute>
                </ProtectedFarmRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
