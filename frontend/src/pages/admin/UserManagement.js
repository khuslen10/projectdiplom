import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Alert, CircularProgress, Grid,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField, 
  MenuItem, IconButton, Chip, TablePagination, InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const UserManagement = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    position: '',
    department: '',
    phone: '',
    hire_date: ''
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState({});
  
  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Role options
  const roleOptions = [
    { value: 'admin', label: 'Админ' },
    { value: 'manager', label: 'Менежер' },
    { value: 'employee', label: 'Ажилтан' }
  ];
  
  // Role colors
  const roleColors = {
    admin: 'error',
    manager: 'warning',
    employee: 'primary'
  };
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        const res = await axios.get('/users');
        setUsers(res.data);
        setFilteredUsers(res.data);
        
      } catch (err) {
        console.error('Хэрэглэгчдийн мэдээлэл ачааллахад алдаа гарлаа:', err);
        setError('Мэдээлэл ачааллахад алдаа гарлаа. Дахин оролдоно уу.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Filter users when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.position && user.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
    setPage(0);
  }, [searchTerm, users]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle dialog open/close
  const handleOpenAddDialog = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      position: '',
      department: '',
      phone: '',
      hire_date: ''
    });
    setFormErrors({});
    setOpenAddDialog(true);
  };
  
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };
  
  const handleOpenEditDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      position: user.position || '',
      department: user.department || '',
      phone: user.phone || '',
      hire_date: user.hire_date ? new Date(user.hire_date).toISOString().split('T')[0] : ''
    });
    setFormErrors({});
    setOpenEditDialog(true);
  };
  
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedUser(null);
  };
  
  // Handle form change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when typing
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Validate form
  const validateForm = (isEdit = false) => {
    const errors = {};
    
    if (!formData.name) {
      errors.name = 'Нэр оруулна уу';
    }
    
    if (!formData.email) {
      errors.email = 'Имэйл хаяг оруулна уу';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Имэйл хаяг буруу байна';
    }
    
    if (!isEdit && !formData.password) {
      errors.password = 'Нууц үг оруулна уу';
    } else if (!isEdit && formData.password && formData.password.length < 6) {
      errors.password = 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой';
    }
    
    if (!formData.role) {
      errors.role = 'Эрх сонгоно уу';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Submit add user form
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const res = await axios.post('/users', formData);
      
      // Add new user to the list
      const newUser = {
        id: res.data.userId,
        ...formData,
        created_at: new Date().toISOString()
      };
      
      setUsers([...users, newUser]);
      
      // Close dialog and show success message
      handleCloseAddDialog();
      setSuccess('Хэрэглэгч амжилттай үүсгэгдлээ');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Хэрэглэгч үүсгэхэд алдаа гарлаа:', err);
      setError(err.response?.data?.message || 'Хэрэглэгч үүсгэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };
  
  // Submit edit user form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm(true)) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Remove password if empty
      const userData = { ...formData };
      if (!userData.password) {
        delete userData.password;
      }
      
      await axios.put(`/users/${selectedUser.id}`, userData);
      
      // Update user in the list
      const updatedUsers = users.map(u => {
        if (u.id === selectedUser.id) {
          return { ...u, ...userData };
        }
        return u;
      });
      
      setUsers(updatedUsers);
      
      // Close dialog and show success message
      handleCloseEditDialog();
      setSuccess('Хэрэглэгчийн мэдээлэл амжилттай шинэчлэгдлээ');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Хэрэглэгч шинэчлэхэд алдаа гарлаа:', err);
      setError(err.response?.data?.message || 'Хэрэглэгч шинэчлэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete user
  const handleDelete = async (id) => {
    // Prevent deleting yourself
    if (id === user.id) {
      setError('Өөрийгөө устгах боломжгүй');
      return;
    }
    
    if (!window.confirm('Та энэ хэрэглэгчийг устгахдаа итгэлтэй байна уу?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      await axios.delete(`/users/${id}`);
      
      // Remove deleted user from the list
      setUsers(users.filter(u => u.id !== id));
      
      setSuccess('Хэрэглэгч амжилттай устгагдлаа');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Хэрэглэгч устгахад алдаа гарлаа:', err);
      setError(err.response?.data?.message || 'Хэрэглэгч устгахад алдаа гарлаа');
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
  
  // Get role label
  const getRoleLabel = (role) => {
    const roleOption = roleOptions.find(r => r.value === role);
    return roleOption ? roleOption.label : role;
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  if (loading && !users.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Хэрэглэгчийн удирдлага
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
      
      {/* Search and Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          placeholder="Хайх..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Шинэ хэрэглэгч
        </Button>
      </Box>
      
      {/* Users Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Нэр</TableCell>
                <TableCell>Имэйл</TableCell>
                <TableCell>Эрх</TableCell>
                <TableCell>Албан тушаал</TableCell>
                <TableCell>Хэлтэс</TableCell>
                <TableCell>Бүртгүүлсэн огноо</TableCell>
                <TableCell>Үйлдэл</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow hover key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getRoleLabel(user.role)} 
                        color={roleColors[user.role] || 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{user.position || '-'}</TableCell>
                    <TableCell>{user.department || '-'}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <Tooltip title="Засах">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleOpenEditDialog(user)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Устгах">
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDelete(user.id)}
                          disabled={user.id === user.id}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {searchTerm ? 'Хайлтад тохирох хэрэглэгч олдсонгүй' : 'Хэрэглэгч байхгүй байна'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Хуудсанд:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>
      
      {/* Add User Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Шинэ хэрэглэгч үүсгэх</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Нэр"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Имэйл хаяг"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="password"
                  label="Нууц үг"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="role"
                  label="Эрх"
                  name="role"
                  select
                  value={formData.role}
                  onChange={handleChange}
                  error={!!formErrors.role}
                  helperText={formErrors.role}
                >
                  {roleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="position"
                  label="Албан тушаал"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="department"
                  label="Хэлтэс"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="phone"
                  label="Утас"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="hire_date"
                  label="Ажилд орсон огноо"
                  name="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Цуцлах</Button>
          <Button 
            onClick={handleAddSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Үүсгэх'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Хэрэглэгч засах</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Нэр"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Имэйл хаяг"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="password"
                  label="Нууц үг (хоосон үлдээвэл өөрчлөгдөхгүй)"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="role"
                  label="Эрх"
                  name="role"
                  select
                  value={formData.role}
                  onChange={handleChange}
                  error={!!formErrors.role}
                  helperText={formErrors.role}
                >
                  {roleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="position"
                  label="Албан тушаал"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="department"
                  label="Хэлтэс"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="phone"
                  label="Утас"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="hire_date"
                  label="Ажилд орсон огноо"
                  name="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Цуцлах</Button>
          <Button 
            onClick={handleEditSubmit} 
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

export default UserManagement;
