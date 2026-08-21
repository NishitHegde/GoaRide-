import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnimatedBackground from './components/AnimatedBackground';
import CustomCursor from './components/CustomCursor';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import VehicleDetails from './pages/VehicleDetails';
import Bookings from './pages/Bookings';
import Tracking from './pages/Tracking';
import AiAssistant from './pages/AiAssistant';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="relative min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b1727] text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden transition-colors duration-300">
            {/* Visual Interactive Background & Custom Cursor Effects */}
            <AnimatedBackground />
            <CustomCursor />

            <Navbar />
            
            <main className="flex-grow z-10 relative">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/vehicles/:id" element={<VehicleDetails />} />
                <Route path="/tracking" element={<Tracking />} />
                <Route path="/ai-assistant" element={<AiAssistant />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* User Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/bookings" element={<Bookings />} />
                </Route>

                {/* Admin Protected Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>

              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}
