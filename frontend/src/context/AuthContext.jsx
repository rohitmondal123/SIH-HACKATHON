import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const PRESET_USERS = [
  {
    role: 'ministry_admin',
    label: 'Ministry / Admin (MoSPI)',
    email: 'admin@mplads.gov.in',
    password: 'Admin@2026',
    name: 'Joint Secretary, MoSPI Central Command',
    scope: 'Nationwide All States & Districts'
  },
  {
    role: 'state_nodal',
    label: 'State Nodal Authority',
    email: 'state@mplads.gov.in',
    password: 'State@2026',
    name: 'Smt. Ananya Sen, IAS, State Nodal Officer',
    scope: 'Uttar Pradesh (All Districts)'
  },
  {
    role: 'district_authority',
    label: 'District Authority / DM',
    email: 'district@mplads.gov.in',
    password: 'District@2026',
    name: 'Dr. S. K. Sharma, IAS, District Magistrate',
    scope: 'Varanasi District'
  },
  {
    role: 'mp',
    label: 'Hon\'ble Member of Parliament (MP)',
    email: 'mp@mplads.gov.in',
    password: 'MPLADS@2026',
    name: 'Sh. Narendra Modi, Hon\'ble MP',
    scope: 'Varanasi Constituency'
  }
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mplads_auth_token'));
  const [loading, setLoading] = useState(true);

  // Initialize with admin default or stored token
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('mplads_auth_token');
      const savedUser = localStorage.getItem('mplads_user_profile');
      
      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          // fallback
        }
      } else {
        // Auto-login as Ministry Admin by default for seamless hackathon demo preview
        try {
          const res = await authService.login('admin@mplads.gov.in', 'Admin@2026');
          setToken(res.access_token);
          setCurrentUser(res.user);
          localStorage.setItem('mplads_auth_token', res.access_token);
          localStorage.setItem('mplads_user_profile', JSON.stringify(res.user));
        } catch (err) {
          console.error("Auto login error:", err);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      setToken(res.access_token);
      setCurrentUser(res.user);
      localStorage.setItem('mplads_auth_token', res.access_token);
      localStorage.setItem('mplads_user_profile', JSON.stringify(res.user));
      setLoading(false);
      return { success: true, user: res.user };
    } catch (err) {
      setLoading(false);
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Invalid login credentials' 
      };
    }
  };

  const switchRolePreset = async (presetEmail, presetPassword) => {
    return await login(presetEmail, presetPassword);
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('mplads_auth_token');
    localStorage.removeItem('mplads_user_profile');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      token,
      loading,
      login,
      logout,
      switchRolePreset,
      isAuthenticated: !!token && !!currentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
