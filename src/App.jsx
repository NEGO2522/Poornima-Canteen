import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './components/Landing';
import Login from './auth/Login';
import UserDashboard from './components/UserDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import Cart from './components/Cart';
import TermsConditions from './components/Terms_Conditions';
import CancellationRefundPolicy from './components/CancellationRefund_Policy';
import Contact from './components/Contact';
import PrivacyPolicy from './components/PrivacyPolicy';
import { auth } from './firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { initializeCanteenData } from './firebase/canteenService';
import { toast } from 'react-toastify';

// Protected Route component with role-based access
const ProtectedRoute = ({ children, requiredRole = 'user' }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const location = useLocation();
  const OWNER_EMAIL = '2024btechaimlkshitij18489@poornima.edu.in';

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  // If no user is logged in, redirect to login with the current location
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is owner based on email
  const isOwner = user.email === OWNER_EMAIL;
  
  // If user is trying to access owner dashboard but is not an owner
  if (requiredRole === 'owner' && !isOwner) {
    toast.error('You do not have permission to access this page');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const [cart, setCart] = useState(() => {
    // Load cart from localStorage on initial render
    const savedCart = localStorage.getItem('canteenCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('canteenCart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('canteenCart');
    }
  }, [cart]);

  // Initialize canteen data when the app loads
  useEffect(() => {
    initializeCanteenData().catch(console.error);
  }, []);

  return (
    <Router>
      <div className="App">
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/cancellation-refund-policy" element={<CancellationRefundPolicy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          
          {/* Protected User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <UserDashboard cart={cart} setCart={setCart} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner-dashboard"
            element={
              <ProtectedRoute requiredRole="owner">
                <OwnerDashboard cart={cart} setCart={setCart} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute requiredRole="user">
                <Cart cart={cart} setCart={setCart} />
              </ProtectedRoute>
            }
          />     
          {/* Protected Owner Routes */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute requiredRole="owner">
                <div>Owner Dashboard - Protected Content</div>
              </ProtectedRoute>
            }
          />
          
          {/* Catch-all route for unauthorized access */}
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />
          
          {/* 404 Route */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;