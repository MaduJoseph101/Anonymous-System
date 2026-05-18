import { createContext, useContext, useState, useEffect, useCallback } 
  from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeAdmin = (adminData) => {
    if (!adminData) return null;
    return {
      ...adminData,
      name: adminData.name || adminData.fullName || adminData.full_name || 'Admin',
      fullName: adminData.fullName || adminData.full_name || adminData.name || 'Admin'
    };
  };

  const restoreSession = useCallback(() => {
    try {
      const token = localStorage.getItem('asirs_admin_token');
      const adminData = localStorage.getItem('asirs_admin_data');

      if (token && adminData) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setAdmin(normalizeAdmin(JSON.parse(adminData)));
        } else {
          localStorage.removeItem('asirs_admin_token');
          localStorage.removeItem('asirs_admin_data');
        }
      }
    } catch {
      localStorage.removeItem('asirs_admin_token');
      localStorage.removeItem('asirs_admin_data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (email, password) => {
    const response = await api.admin.login({ email, password });
    const { token, admin: adminData } = response;
    const normalizedAdmin = normalizeAdmin(adminData);
    localStorage.setItem('asirs_admin_token', token);
    localStorage.setItem('asirs_admin_data', JSON.stringify(normalizedAdmin));
    setAdmin(normalizedAdmin);
    return normalizedAdmin;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('asirs_admin_token');
    localStorage.removeItem('asirs_admin_data');
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
