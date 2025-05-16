import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  TextField, Button, Box, Typography, Link, Alert, 
  InputAdornment, IconButton, CircularProgress,
  Paper, Divider, Avatar, Card, CardContent, Stack,
  useTheme, useMediaQuery
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined, LoginOutlined } from '@mui/icons-material';

const LoginForm = ({ 
  email, 
  password, 
  handleChange, 
  handleSubmit, 
  toggleShowPassword, 
  showPassword, 
  formErrors, 
  loading, 
  error 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar 
          sx={{ 
            bgcolor: 'primary.main', 
            width: 70, 
            height: 70,
            mx: 'auto',
            mb: 2,
            boxShadow: 2
          }}
        >
          <LockOutlined fontSize="large" />
        </Avatar>
        
        <Typography 
          component="h1" 
          variant="h3" 
          fontWeight="bold"
          color="primary.main"
        >
          Нэвтрэх
        </Typography>
      </Box>
      
      {error && (
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ 
            mb: 4, 
            borderRadius: 2,
            boxShadow: 1,
            fontSize: '1rem'
          }}
        >
          {error}
        </Alert>
      )}
      
      <Stack spacing={4}>
        <TextField
          required
          fullWidth
          id="email"
          label="Имэйл хаяг"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={handleChange}
          error={!!formErrors.email}
          helperText={formErrors.email}
          disabled={loading}
          variant="outlined"
          InputProps={{
            sx: { borderRadius: 2, height: 60 }
          }}
          sx={{ mb: 2 }}
        />
        
        <TextField
          required
          fullWidth
          name="password"
          label="Нууц үг"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={handleChange}
          error={!!formErrors.password}
          helperText={formErrors.password}
          disabled={loading}
          variant="outlined"
          InputProps={{
            sx: { borderRadius: 2, height: 60 },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={toggleShowPassword}
                  edge="end"
                  sx={{ color: 'primary.main' }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />
      </Stack>
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        startIcon={!loading && <LoginOutlined />}
        sx={{ 
          mt: 5, 
          mb: 3, 
          py: 2.5,
          fontSize: '1.2rem',
          fontWeight: 'bold',
          borderRadius: 2,
          textTransform: 'none',
          boxShadow: 2,
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-2px)',
            transition: 'all 0.3s'
          }
        }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Нэвтрэх'}
      </Button>
      
      <Divider sx={{ 
        my: 3,
        '&::before, &::after': {
          borderColor: 'primary.light',
        }
      }}>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            px: 2,
            py: 0.5,
            borderRadius: 1,
            fontWeight: 'medium'
          }}
        >
          Эсвэл
        </Typography>
      </Divider>
      
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Link 
          component={RouterLink} 
          to="/register" 
          variant="h6"
          sx={{ 
            textDecoration: 'none',
            fontWeight: 600,
            color: 'primary.main',
            '&:hover': { 
              textDecoration: 'underline',
              color: 'primary.dark'
            } 
          }}
        >
          {"Бүртгэлгүй бол энд дарж бүртгүүлнэ үү"}
        </Link>
      </Box>
    </Box>
  );
};

export default LoginForm;
