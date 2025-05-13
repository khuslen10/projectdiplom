import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Хэрэглэгчийн мэдээллийг хадгалах
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Axios үндсэн тохиргоог тохируулах
  axios.defaults.baseURL = 'http://localhost:5000/api';
  
  // Токены хүчинтэй хугацаа дууссан эсэхийг шалгах
  useEffect(() => {
    if (token) {
      // Axios хедерт токен тохируулах
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      // Axios хедерт токен тохируулах
      delete axios.defaults.headers.common['x-auth-token'];
    }
  }, [token]);

  // Токеноос хэрэглэгчийн мэдээллийг ачаалах
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Токены хүчинтэй хугацаа дууссан эсэхийг шалгах
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // Токены хүчинтэй хугацаа дууссан бол лог аут хийх
          logout();
          setLoading(false);
          return;
        }

        // Хэрэглэгчийн мэдээллийг ачаалах
        const res = await axios.get('/auth/me');
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Хэрэглэгчийн мэдээлэл ачааллахад алдаа гарлаа:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Хэрэглэгч бүртгэх
  const register = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post('/auth/register', formData);
      // Хэрэглэгчийн төлвийг буцсан өгөгдөл эсвэл цэвэрлэсэн өгөгдлөөр шинэчлэх
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Бүртгэл үүсгэхэд алдаа гарлаа');
      return { success: false, error: err.response?.data };
    } finally {
      setLoading(false);
    }
  };

  // Хэрэглэгч нэвтрэх
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post('/auth/login', { email, password });
      // Токеныг localStorage-д хадгалах
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Нэвтрэхэд алдаа гарлаа');
      return { success: false, error: err.response?.data };
    } finally {
      setLoading(false);
    }
  };

  // Хэрэглэгч гарах
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Нууц үг солих
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.put('/auth/change-password', { 
        currentPassword, 
        newPassword 
      });
      
      return { success: true, message: res.data.message };
    } catch (err) {
      setError(err.response?.data?.message || 'Нууц үг солиход алдаа гарлаа');
      return { success: false, error: err.response?.data };
    } finally {
      setLoading(false);
    }
  };

  // Профайл шинэчлэх
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Хэрэглэгчийн ID хүчинтэй эсэхийг шалгах
      if (!user || !user.id) {
        throw new Error('User information not available');
      }
      
      // Хэрэглэгчийн мэдээллийг шинэчлэх
      const cleanData = Object.fromEntries(
        Object.entries(userData).filter(([_, v]) => v !== undefined)
      );
      
      const res = await axios.put(`/users/${user.id}`, cleanData);
      
      // Хэрэглэгчийн мэдээллийг шинэчлэх
      setUser({ ...user, ...cleanData });
      
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error('Профайл шинэчлэх алдаа:', err);
      setError(err.response?.data?.message || 'Профайл шинэчлэхэд алдаа гарлаа');
      return { success: false, error: err.response?.data || err };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        changePassword,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
