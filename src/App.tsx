
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import AnimalList from '@/pages/AnimalList';
import AnimalForm from '@/pages/AnimalForm';
import AnimalEdit from '@/pages/AnimalEdit';
import AnimalDetail from '@/pages/AnimalDetail';
import HealthRecords from '@/pages/HealthRecords';
import Breeding from '@/pages/Breeding';
import Calendar from '@/pages/Calendar';
import Reports from '@/pages/Reports';
import Lots from '@/pages/Lots';
import Settings from '@/pages/Settings';
import Notifications from '@/pages/Notifications';
import NotFound from '@/pages/NotFound';
import GmailCallback from '@/pages/GmailCallback';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/gmail-callback" element={<GmailCallback />} />
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
          <Route path="/animals/:id/edit" element={
            <ProtectedRoute>
              <AnimalEdit />
            </ProtectedRoute>
          } />
          <Route path="/animals/:id" element={
            <ProtectedRoute>
              <AnimalDetail />
            </ProtectedRoute>
          } />
          <Route path="/health" element={
            <ProtectedRoute>
              <HealthRecords />
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
          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/lots" element={
            <ProtectedRoute>
              <Lots />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
