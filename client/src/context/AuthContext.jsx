import { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin as loginAPI, getAdminProfile } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('lifeline_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getAdminProfile();
      setAdmin(res.data.admin);
      setHospital(res.data.hospital);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const res = await loginAPI(username, password);
    const { token: newToken, admin: adminData, hospital: hospitalData } = res.data;
    localStorage.setItem('lifeline_token', newToken);
    localStorage.setItem('lifeline_admin', JSON.stringify(adminData));
    setToken(newToken);
    setAdmin(adminData);
    setHospital(hospitalData);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('lifeline_token');
    localStorage.removeItem('lifeline_admin');
    setToken(null);
    setAdmin(null);
    setHospital(null);
  };

  const updateHospitalData = (newData) => {
    setHospital(prev => ({ ...prev, ...newData }));
  };

  return (
    <AuthContext.Provider value={{
      admin,
      hospital,
      token,
      loading,
      isAuthenticated: !!token,
      login,
      logout,
      updateHospitalData,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
