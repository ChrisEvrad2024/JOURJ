import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthService } from '../services';
import { toast } from 'sonner';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const user = await AuthService.login(email, password);
      setCurrentUser(user);
      return user;
    } catch (error) {
      toast.error('Échec de la connexion', {
        description: error.message || 'Vérifiez vos identifiants et réessayez',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const user = await AuthService.register(userData);
      setCurrentUser(user);
      return user;
    } catch (error) {
      toast.error('Échec de l\'inscription', {
        description: error.message || 'Veuillez réessayer',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AuthService.logout();
      setCurrentUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    setLoading(true);
    try {
      const updatedUser = await AuthService.updateProfile(userData);
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      toast.error('Échec de la mise à jour du profil', {
        description: error.message || 'Veuillez réessayer',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    initialized,
    login,
    register,
    logout,
    updateProfile,
    isAdmin: currentUser?.role === 'admin',
    isSuperAdmin: currentUser?.role === 'superadmin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};