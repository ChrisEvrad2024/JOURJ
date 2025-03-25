// src/components/auth/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser, loading, initialized } = useAuth();
  const location = useLocation();

  // Si l'authentification est en cours d'initialisation, on affiche un loader
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  // Vérifier si l'utilisateur est connecté
  if (!currentUser) {
    // Rediriger vers la page de connexion avec l'emplacement actuel
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  // Vérifier si l'utilisateur est admin (si nécessaire)
  if (requireAdmin && currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  // Si tout est ok, on affiche le contenu protégé
  return children;
};

export default ProtectedRoute;