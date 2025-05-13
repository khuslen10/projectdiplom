import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  TextField, Button, Box, Typography, Link, Alert, 
  InputAdornment, IconButton, CircularProgress,
  Grid
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
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
  
  const { name, email, password, confirmPassword } = formData;
  
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
    } else if (password.length < 6) {
      errors.password = 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой';
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
  
  if (success) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          Бүртгэл амжилттай үүсгэгдлээ! Нэвтрэх хуудас руу шилжүүлж байна...
        </Alert>
        <Link component={RouterLink} to="/login" variant="body2">
          Нэвтрэх хуудас руу шилжих
        </Link>
      </Box>
    );
  }
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Typography component="h1" variant="h5" align="center" gutterBottom>
        Бүртгүүлэх
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="name"
            label="Нэр"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={handleChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="email"
            label="Имэйл хаяг"
            name="email"
            autoComplete="email"
            value={email}
            onChange={handleChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            name="password"
            label="Нууц үг"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={handleChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            name="confirmPassword"
            label="Нууц үг баталгаажуулах"
            type={showPassword ? 'text' : 'password'}
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={handleChange}
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
            disabled={loading}
          />
        </Grid>
      </Grid>
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Бүртгүүлэх'}
      </Button>
      
      <Box sx={{ textAlign: 'center' }}>
        <Link component={RouterLink} to="/login" variant="body2">
          {"Бүртгэлтэй бол энд дарж нэвтэрнэ үү"}
        </Link>
      </Box>
    </Box>
  );
};

export default Register;
