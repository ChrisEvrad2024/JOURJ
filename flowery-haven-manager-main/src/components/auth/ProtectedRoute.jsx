// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Using JSX props instead of TypeScript interface
// This fixes the "interface ProtectedRouteProps" syntax error
const ProtectedRoute = ({ children, requireAdmin = false, adminOnly = false }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Handle loading state during authentication check
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  // User not authenticated
  if (!currentUser) {
    toast.error('Veuillez vous connecter pour accéder à cette page');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin only routes
  if (adminOnly && !isAdmin) {
    toast.error('Accès réservé aux administrateurs');
    return <Navigate to="/" replace />;
  }

  // Routes requiring admin verification
  if (requireAdmin && !isAdmin) {
    return <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Accès limité</h1>
      <p className="mb-6">
        Cette section nécessite des droits d'administrateur. Veuillez contacter l'équipe si vous pensez devoir y avoir accès.
      </p>
      <button 
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Retour
      </button>
    </div>;
  }

  // If all checks pass, render the children
  return children;
};

export default ProtectedRoute;