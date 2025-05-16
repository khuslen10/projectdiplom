import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button,
  InputAdornment, IconButton, CircularProgress, Alert, Stack, Paper
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, ArrowForward } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const { email, password } = formData;
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when typing
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!email) {
      errors.email = 'Имэйл хаяг оруулна уу';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Имэйл хаяг буруу байна';
    }
    
    if (!password) {
      errors.password = 'Нууц үг оруулна уу';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center', 
      alignItems: 'center',
      width: '100%',
      background: '#f5f5f5',
      p: 0
    }}>
      <Box sx={{
        width: '100%',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        borderRadius: 0,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <Box sx={{
          bgcolor: '#fff',
          p: 3,
          pb: 0
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 3, 
              color: '#333',
              textAlign: 'center'
            }}
          >
            Ажилтны удирдлагын систем
          </Typography>
        </Box>
        
        <Box 
          sx={{
            p: 3
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 3, 
              color: '#333' 
            }}
          >
            Нэвтрэх
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
                {error}
              </Alert>
            )}
            
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="body2" mb={0.5} color="text.secondary">
                  Имэйл хаяг
                </Typography>
                <TextField
                  required
                  fullWidth
                  id="email"
                  placeholder="tanii@email.com"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  disabled={loading}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    sx: { 
                      borderRadius: 0,
                      height: 40
                    },
                    endAdornment: email && !formErrors.email && email.includes('@') ? (
                      <InputAdornment position="end">
                        <CheckCircle color="success" fontSize="small" />
                      </InputAdornment>
                    ) : null
                  }}
                />
              </Box>
              
              <Box>
                <Typography variant="body2" mb={0.5} color="text.secondary">
                  Нууц үг
                </Typography>
                <TextField
                  required
                  fullWidth
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  disabled={loading}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    sx: { 
                      borderRadius: 0,
                      height: 40
                    },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={toggleShowPassword}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
            </Stack>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disableElevation
              sx={{ 
                mt: 3,
                py: 1,
                bgcolor: '#3f51b5',
                color: 'white',
                borderRadius: 0,
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: '#303f9f'
                }
              }}
              disabled={loading}
              endIcon={<ArrowForward />}
            >
              {loading ? <CircularProgress size={24} /> : 'Нэвтрэх'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Бүртгэлгүй хэрэглэгч үү?{' '}
                <RouterLink 
                  to="/register" 
                  style={{ 
                    color: '#3f51b5', 
                    textDecoration: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Бүртгүүлэх
                </RouterLink>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
