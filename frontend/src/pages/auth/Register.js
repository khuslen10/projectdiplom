import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  TextField, Button, Box, Typography, Alert, 
  InputAdornment, IconButton, CircularProgress,
  Stack, LinearProgress, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import { 
  Visibility, VisibilityOff, CheckCircle, FiberManualRecord, ArrowForward
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const Register = () => {
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validations, setValidations] = useState({
    hasMinLength: false,
    hasSpecialChar: false
  });
  
  const { name, email, password, confirmPassword } = formData;
  
  useEffect(() => {
    if (password) {
      // Calculate password strength
      let strength = 0;
      
      // Check for minimum length
      if (password.length >= 8) {
        strength += 33;
        setValidations(prev => ({ ...prev, hasMinLength: true }));
      } else {
        setValidations(prev => ({ ...prev, hasMinLength: false }));
      }
      
      // Check for numbers or special characters
      if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
        strength += 33;
        setValidations(prev => ({ ...prev, hasSpecialChar: true }));
      } else {
        setValidations(prev => ({ ...prev, hasSpecialChar: false }));
      }
      
      // Check if passwords match
      if (password === confirmPassword && confirmPassword) {
        strength += 34;
      }
      
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
      setValidations({
        hasMinLength: false,
        hasSpecialChar: false
      });
    }
  }, [password, confirmPassword]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when typing
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!name) {
      errors.name = 'Нэр оруулна уу';
    }
    
    if (!email) {
      errors.email = 'Имэйл хаяг оруулна уу';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Имэйл хаяг буруу байна';
    }
    
    if (!password) {
      errors.password = 'Нууц үг оруулна уу';
    } else if (password.length < 8) {
      errors.password = 'Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой';
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Нууц үг таарахгүй байна';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const userData = {
      name,
      email,
      password,
      role: 'employee' // Default role for self-registration
    };
    
    const result = await register(userData);
    
    if (result.success) {
      setSuccess(true);
      // Redirect to login after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength < 33) return 'Сул';
    if (passwordStrength < 66) return 'Дунд';
    if (passwordStrength < 100) return 'Хүчтэй';
    return 'Маш хүчтэй';
  };
  
  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'default';
    if (passwordStrength < 33) return 'error';
    if (passwordStrength < 66) return 'warning';
    return 'success';
  };
  
  if (success) {
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
          bgcolor: 'white',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          p: 3,
          textAlign: 'center'
        }}>
          <Typography variant="h4" fontWeight="bold" mb={3} color="success.main">
            Амжилттай!
          </Typography>
          
          <Alert 
            severity="success" 
            variant="filled"
            sx={{ 
              mb: 3, 
              borderRadius: 0
            }}
          >
            Бүртгэл амжилттай үүсгэгдлээ! Нэвтрэх хуудас руу шилжүүлж байна...
          </Alert>
          
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            fullWidth
            sx={{ 
              py: 1, 
              borderRadius: 0,
              bgcolor: '#3f51b5',
              '&:hover': {
                bgcolor: '#303f9f'
              }
            }}
          >
            Нэвтрэх хуудас руу шилжих
          </Button>
        </Box>
      </Box>
    );
  }
  
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
            Бүртгүүлэх
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {error && (
              <Alert 
                severity="error" 
                variant="filled"
                sx={{ 
                  mb: 3, 
                  borderRadius: 0
                }}
              >
                {error}
              </Alert>
            )}
            
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="body2" mb={0.5} color="text.secondary">
                  Нэр
                </Typography>
                <TextField
                  required
                  fullWidth
                  id="name"
                  placeholder="Нэр"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  disabled={loading}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    sx: { 
                      borderRadius: 0,
                      height: 40
                    },
                    endAdornment: name ? (
                      <InputAdornment position="end">
                        <CheckCircle color="success" fontSize="small" />
                      </InputAdornment>
                    ) : null
                  }}
                />
              </Box>
              
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Нууц үг
                  </Typography>
                  {password && (
                    <Typography variant="body2" color={getPasswordStrengthColor()}>
                      {getPasswordStrengthText()}
                    </Typography>
                  )}
                </Box>
                <TextField
                  required
                  fullWidth
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
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
                {password && (
                  <LinearProgress 
                    variant="determinate" 
                    value={passwordStrength} 
                    color={getPasswordStrengthColor()}
                    sx={{ mt: 1, borderRadius: 0, height: 3 }}
                  />
                )}
              </Box>
              
              <Box>
                <Typography variant="body2" mb={0.5} color="text.secondary">
                  Нууц үг баталгаажуулах
                </Typography>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={handleChange}
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
                  disabled={loading}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    sx: { 
                      borderRadius: 0,
                      height: 40
                    },
                    endAdornment: confirmPassword && password === confirmPassword ? (
                      <InputAdornment position="end">
                        <CheckCircle color="success" fontSize="small" />
                      </InputAdornment>
                    ) : null
                  }}
                />
              </Box>
            </Stack>
            
            <Box sx={{ mt: 2 }}>
              <List dense disablePadding>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <FiberManualRecord 
                      sx={{ 
                        fontSize: 8, 
                        color: validations.hasMinLength ? 'success.main' : 'text.secondary' 
                      }} 
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой" 
                    primaryTypographyProps={{ 
                      variant: 'body2', 
                      fontSize: '0.8rem',
                      color: validations.hasMinLength ? 'success.main' : 'text.secondary'
                    }} 
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <FiberManualRecord 
                      sx={{ 
                        fontSize: 8, 
                        color: validations.hasSpecialChar ? 'success.main' : 'text.secondary' 
                      }} 
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Тоо эсвэл тусгай тэмдэгт агуулсан байх" 
                    primaryTypographyProps={{ 
                      variant: 'body2', 
                      fontSize: '0.8rem',
                      color: validations.hasSpecialChar ? 'success.main' : 'text.secondary'
                    }} 
                  />
                </ListItem>
              </List>
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disableElevation
              sx={{ 
                mt: 3,
                py: 1,
                borderRadius: 0,
                bgcolor: '#3f51b5',
                color: 'white',
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: '#303f9f'
                }
              }}
              disabled={loading}
              endIcon={<ArrowForward />}
            >
              {loading ? <CircularProgress size={24} /> : 'Бүртгүүлэх'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Бүртгэлтэй хэрэглэгч үү?{' '}
                <RouterLink 
                  to="/login" 
                  style={{ 
                    color: '#3f51b5', 
                    textDecoration: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Нэвтрэх
                </RouterLink>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
