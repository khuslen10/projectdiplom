import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Grid, TextField, Button, Alert, 
  CircularProgress, Divider, Card, CardContent, CardActions,
  Dialog, DialogActions, DialogContent, DialogTitle, 
  InputAdornment, IconButton, Avatar, Tooltip, Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  PhotoCamera as CameraIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Profile form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    phone: '',
    hire_date: ''
  });
  
  // Profile picture
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  
  // Password change form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  
  // Password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password change dialog
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  
  // Initialize form data with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        position: user.position || '',
        department: user.department || '',
        phone: user.phone || '',
        hire_date: user.hire_date || ''
      });
      
      // If user has a profile picture, set it
      if (user.profile_picture) {
        setPreviewUrl(`http://localhost:5000/uploads/${user.profile_picture}`);
      }
      
      // Check if we need to fetch profile data
      const fetchProfileData = async () => {
        try {
          const profileRes = await axios.get('/profile/me');
          if (profileRes.data && profileRes.data.image_path) {
            setPreviewUrl(`http://localhost:5000/uploads/${profileRes.data.image_path}`);
          }
        } catch (err) {
          console.warn('Could not fetch profile data:', err.message);
        }
      };
      
      fetchProfileData();
      
      // Also check if we have profile data with image path
      if (user.profile && user.profile.image_path) {
        setPreviewUrl(`http://localhost:5000/uploads/${user.profile.image_path}`);
      }
    }
  }, [user]);
  
  // Handle profile form change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when typing
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };
  
  // Handle profile picture change
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  // Handle password form change
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    // Clear error when typing
    if (passwordErrors[e.target.name]) {
      setPasswordErrors({ ...passwordErrors, [e.target.name]: '' });
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };
  
  // Open password change dialog
  const handleOpenPasswordDialog = () => {
    setOpenPasswordDialog(true);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
  };
  
  // Close password change dialog
  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
  };
  
  // Validate profile form
  const validateProfileForm = () => {
    const errors = {};
    
    if (!formData.name) {
      errors.name = 'Нэр оруулна уу';
    }
    
    if (!formData.email) {
      errors.email = 'Имэйл хаяг оруулна уу';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Имэйл хаяг буруу байна';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Одоогийн нууц үг оруулна уу';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'Шинэ нууц үг оруулна уу';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Нууц үг таарахгүй байна';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Submit profile form
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let profilePictureFilename = null;
      
      // First handle profile picture upload if there is one
      if (profilePicture) {
        const pictureFormData = new FormData();
        pictureFormData.append('image', profilePicture);
        
        try {
          const uploadRes = await axios.post('/profile/me/image', pictureFormData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          profilePictureFilename = uploadRes.data.imagePath;
          console.log('Profile picture uploaded successfully:', profilePictureFilename);
        } catch (uploadErr) {
          console.error('Profile picture upload failed:', uploadErr);
          // We'll continue with the profile update even if the image upload fails
        }
      }
      
      // Prepare profile data for update - only include fields that have values
      const profileData = {};
      
      // Add non-empty fields
      if (formData.name) profileData.name = formData.name;
      if (formData.position !== undefined) profileData.position = formData.position;
      if (formData.department !== undefined) profileData.department = formData.department;
      if (formData.phone !== undefined) profileData.phone = formData.phone;
      if (formData.hire_date) profileData.hire_date = formData.hire_date;
      
      // Only include profile_picture if we successfully uploaded one
      if (profilePictureFilename) {
        profileData.profile_picture = profilePictureFilename;
      }
      
      console.log('Submitting profile update with data:', profileData);
      
      // Update profile information
      const result = await updateProfile(profileData);

      if (result.success) {
        setSuccess('Профайл амжилттай шинэчлэгдлээ');
      } else {
        setError(result.error?.message || 'Профайл шинэчлэхэд алдаа гарлаа');
      }
    } catch (err) {
      console.error('Профайл шинэчлэхэд алдаа гарлаа:', err);
      setError(err.response?.data?.message || 'Профайл шинэчлэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };
  
  // Submit password change form
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (result.success) {
        setSuccess('Нууц үг амжилттай шинэчлэгдлээ');
        handleClosePasswordDialog();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setPasswordErrors({
          ...passwordErrors,
          currentPassword: result.error?.message || 'Нууц үг шинэчлэхэд алдаа гарлаа'
        });
      }
    } catch (err) {
      console.error('Нууц үг шинэчлэхэд алдаа гарлаа:', err);
      setPasswordErrors({
        ...passwordErrors,
        currentPassword: 'Нууц үг шинэчлэхэд алдаа гарлаа'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('mn-MN');
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Профайл
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* User Info Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} display="flex" justifyContent="center" mb={2}>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar
                            src={previewUrl || 
                                 (user.profile?.image_path ? `http://localhost:5000/uploads/${user.profile.image_path}` : '')}
                            alt={user.name}
                            sx={{ width: 120, height: 120, mb: 2 }}
                          />
                          <Chip 
                            label={user.role === 'admin' ? 'Админ' : user.role === 'manager' ? 'Менежер' : 'Ажилтан'}
                            color={user.role === 'admin' ? 'error' : user.role === 'manager' ? 'warning' : 'primary'}
                            size="small"
                            sx={{ position: 'absolute', bottom: 16, right: -10 }}
                          />
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="subtitle1">Нэр</Typography>
                        </Box>
                        <Typography variant="body1">{user.name}</Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="subtitle1">Имэйл</Typography>
                        </Box>
                        <Typography variant="body1">{user.email}</Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <BadgeIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="subtitle1">Албан тушаал</Typography>
                        </Box>
                        <Typography variant="body1">{user.position || '-'}</Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="subtitle1">Хэлтэс</Typography>
                        </Box>
                        <Typography variant="body1">{user.department || '-'}</Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="subtitle1">Утас</Typography>
                        </Box>
                        <Typography variant="body1">{user.phone || '-'}</Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="subtitle1">Ажилд орсон огноо</Typography>
                        </Box>
                        <Typography variant="body1">{user.hire_date ? formatDate(user.hire_date) : '-'}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      color="primary"
                      startIcon={<LockIcon />}
                      onClick={handleOpenPasswordDialog}
                    >
                      Нууц үг солих
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Edit Profile Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Профайл засах
            </Typography>
            
            <Box component="form" onSubmit={handleProfileSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} display="flex" justifyContent="center" mb={2}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={previewUrl}
                      alt={formData.name}
                      sx={{ width: 120, height: 120, mb: 1 }}
                    />
                    <Tooltip title="Зураг оруулах">
                      <IconButton 
                        sx={{ 
                          position: 'absolute', 
                          bottom: 0, 
                          right: -10,
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '&:hover': { backgroundColor: 'primary.dark' }
                        }}
                        onClick={handleUploadClick}
                      >
                        <CameraIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      ref={fileInputRef}
                      onChange={handleProfilePictureChange}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Нэр"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Имэйл"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Албан тушаал"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Хэлтэс"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Утас"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ажилд орсон огноо"
                    name="hire_date"
                    type="date"
                    value={formData.hire_date || ''}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={<SaveIcon />}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Хадгалах'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Password Change Dialog */}
      <Dialog open={openPasswordDialog} onClose={handleClosePasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Нууц үг солих</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="currentPassword"
              label="Одоогийн нууц үг"
              type={showCurrentPassword ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              error={!!passwordErrors.currentPassword}
              helperText={passwordErrors.currentPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('current')}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="Шинэ нууц үг"
              type={showNewPassword ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('new')}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Шинэ нууц үг баталгаажуулах"
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('confirm')}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Цуцлах</Button>
          <Button 
            onClick={handlePasswordSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Хадгалах'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
