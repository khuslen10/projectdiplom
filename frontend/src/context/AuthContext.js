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
        const userData = res.data;
        
        try {
          // Хэрэглэгчийн профайл мэдээллийг ачаалах
          console.log('Getting profile for user ID:', userData.id);
          const profileRes = await axios.get('/profile/me');
          console.log('Profile data:', profileRes.data);
          // Add profile data to user object
          userData.profile = profileRes.data;
        } catch (profileErr) {
          // Continue even if profile fetch fails
          console.warn('Could not fetch profile:', profileErr.message);
        }
        
        setUser(userData);
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
      
      // Separate profile data and user data
      const { profile_picture, ...userBasicData } = userData;
      
      // Хэрэглэгчийн мэдээллийг шинэчлэх
      const cleanData = Object.fromEntries(
        Object.entries(userBasicData).filter(([_, v]) => v !== undefined)
      );
      
      // Update user data through users API
      let userUpdateResponse = null;
      if (Object.keys(cleanData).length > 0) {
        userUpdateResponse = await axios.put(`/users/${user.id}`, cleanData);
      }
      
      // Update profile data through profile API
      const profileData = {
        first_name: userData.first_name,
        last_name: userData.last_name, 
        phone: userData.phone || '',
        address: userData.address || ''
      };
      
      let profileUpdateResponse = null;
      try {
        profileUpdateResponse = await axios.put('/profile/me', profileData);
      } catch (profileErr) {
        console.warn('Profile update error:', profileErr);
        // Continue even if profile update fails
      }
      
      // Fetch updated user and profile data
      const updatedUserRes = await axios.get('/auth/me');
      const updatedUserData = updatedUserRes.data;
      
      try {
        const profileRes = await axios.get('/profile/me');
        updatedUserData.profile = profileRes.data;
      } catch (profileErr) {
        console.warn('Could not fetch updated profile:', profileErr.message);
      }
      
      // Update the user state with fresh data
      setUser(updatedUserData);
      
      return { 
        success: true, 
        message: userUpdateResponse?.data?.message || 'Профайл амжилттай шинэчлэгдлээ'
      };
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
