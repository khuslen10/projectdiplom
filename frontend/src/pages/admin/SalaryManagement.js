import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Alert, CircularProgress, Grid,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField, 
  MenuItem, IconButton, Chip, TablePagination, InputAdornment,
  Tooltip, FormControl, InputLabel, Select
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const SalaryManagement = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [salaries, setSalaries] = useState([]);
  const [filteredSalaries, setFilteredSalaries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  
  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    user_id: '',
    base_salary: '',
    bonus: '',
    allowance: '',
    deductions: '',
    effective_date: '',
    notes: ''
  });
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Fetch salary records and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch salary records
        const salariesRes = await axios.get('/salary');
        setSalaries(salariesRes.data);
        setFilteredSalaries(salariesRes.data);
        
        // Fetch employees
        const employeesRes = await axios.get('/users');
        setEmployees(employeesRes.data);
        
      } catch (err) {
        console.error('Мэдээлэл ачааллахад алдаа гарлаа:', err);
        setError('Мэдээлэл ачааллахад алдаа гарлаа. Дахин оролдоно уу.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter salaries when search term or selected employee changes
  useEffect(() => {
    let filtered = [...salaries];
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(salary => 
        salary.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salary.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (salary.department && salary.department.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by selected employee
    if (selectedEmployee) {
      filtered = filtered.filter(salary => salary.user_id === selectedEmployee);
    }
    
    setFilteredSalaries(filtered);
    setPage(0);
  }, [searchTerm, selectedEmployee, salaries]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle employee selection change
  const handleEmployeeChange = (e) => {
    setSelectedEmployee(e.target.value);
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedEmployee('');
  };
  
  // Handle dialog open/close
  const handleOpenAddDialog = () => {
    setFormData({
      user_id: '',
      base_salary: '',
      bonus: '0',
      allowance: '0',
      deductions: '0',
      effective_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setOpenAddDialog(true);
  };
  
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };
  
  const handleOpenEditDialog = (salary) => {
    setSelectedSalary(salary);
    setFormData({
      user_id: salary.user_id,
      base_salary: salary.base_salary.toString(),
      bonus: salary.bonus ? salary.bonus.toString() : '0',
      allowance: salary.allowance ? salary.allowance.toString() : '0',
      deductions: salary.deductions ? salary.deductions.toString() : '0',
      effective_date: new Date(salary.effective_date).toISOString().split('T')[0],
      notes: salary.notes || ''
    });
    setOpenEditDialog(true);
  };
  
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedSalary(null);
  };
  
  const handleOpenViewDialog = (salary) => {
    setSelectedSalary(salary);
    setOpenViewDialog(true);
  };
  
  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedSalary(null);
  };
  
  // Handle form change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Calculate net salary
  const calculateNetSalary = (salary) => {
    const base = parseFloat(salary.base_salary) || 0;
    const bonus = parseFloat(salary.bonus) || 0;
    const allowance = parseFloat(salary.allowance) || 0;
    const deductions = parseFloat(salary.deductions) || 0;
    
    return base + bonus + allowance - deductions;
  };
  
  // Submit add salary form
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const res = await axios.post('/salary', formData);
      
      // Get employee details
      const employee = employees.find(emp => emp.id === formData.user_id);
      
      // Add new salary to the list
      const newSalary = {
        id: res.data.salaryId,
        ...formData,
        user_name: employee.name,
        user_email: employee.email,
        department: employee.department,
        created_at: new Date().toISOString()
      };
      
      setSalaries([...salaries, newSalary]);
      
      // Close dialog and show success message
      handleCloseAddDialog();
      setSuccess('Цалингийн мэдээлэл амжилттай үүсгэгдлээ');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Цалингийн мэдээлэл үүсгэхэд алдаа гарлаа:', err);
      setError(err.response?.data?.message || 'Цалингийн мэдээлэл үүсгэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };
  
  // Submit edit salary form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await axios.put(`/salary/${selectedSalary.id}`, formData);
      
      // Update salary in the list
      const updatedSalaries = salaries.map(salary => {
        if (salary.id === selectedSalary.id) {
          return { ...salary, ...formData };
        }
        return salary;
      });
      
      setSalaries(updatedSalaries);
      
      // Close dialog and show success message
      handleCloseEditDialog();
      setSuccess('Цалингийн мэдээлэл амжилттай шинэчлэгдлээ');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Цалингийн мэдээлэл шинэчлэхэд алдаа гарлаа:', err);
      setError(err.response?.data?.message || 'Цалингийн мэдээлэл шинэчлэхэд алдаа гарлаа');
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
  
  // Format currency
  const formatCurrency = (amount) => {
    // Handle null, undefined, or NaN values
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
      return '0 ₮';
    }
    return new Intl.NumberFormat('mn-MN').format(amount) + ' ₮';
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Export salary data to CSV
  const exportToCSV = () => {
    const headers = ['Ажилтан', 'Хэлтэс', 'Үндсэн цалин', 'Урамшуулал', 'Нэмэгдэл', 'Суутгал', 'Нийт цалин', 'Огноо'];
    
    const csvData = filteredSalaries.map(salary => [
      salary.user_name,
      salary.department || '-',
      salary.base_salary,
      salary.bonus || 0,
      salary.allowance || 0,
      salary.deductions || 0,
      calculateNetSalary(salary),
      formatDate(salary.effective_date)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `salary_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (loading && !salaries.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Цалингийн удирдлага
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
      
      {/* Filters and Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Хайх..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ width: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl sx={{ width: 250 }} size="small">
            <InputLabel>Ажилтан</InputLabel>
            <Select
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              label="Ажилтан"
            >
              <MenuItem value="">
                <em>Бүгд</em>
              </MenuItem>
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            onClick={handleResetFilters}
          >
            Цэвэрлэх
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={exportToCSV}
          >
            Экспорт
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Шинэ цалин
          </Button>
        </Box>
      </Box>
      
      {/* Salaries Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Ажилтан</TableCell>
                <TableCell>Хэлтэс</TableCell>
                <TableCell>Үндсэн цалин</TableCell>
                <TableCell>Урамшуулал</TableCell>
                <TableCell>Нийт цалин</TableCell>
                <TableCell>Огноо</TableCell>
                <TableCell>Үйлдэл</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSalaries
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((salary) => (
                  <TableRow hover key={salary.id}>
                    <TableCell>{salary.user_name}</TableCell>
                    <TableCell>{salary.department || '-'}</TableCell>
                    <TableCell>{formatCurrency(salary.base_salary)}</TableCell>
                    <TableCell>{formatCurrency(salary.bonus)}</TableCell>
                    <TableCell>{formatCurrency(calculateNetSalary(salary))}</TableCell>
                    <TableCell>{formatDate(salary.effective_date)}</TableCell>
                    <TableCell>
                      <Tooltip title="Дэлгэрэнгүй">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleOpenViewDialog(salary)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Засах">
                        <IconButton 
                          size="small" 
                          color="secondary" 
                          onClick={() => handleOpenEditDialog(salary)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              
              {filteredSalaries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {searchTerm || selectedEmployee ? 'Хайлтад тохирох мэдээлэл олдсонгүй' : 'Цалингийн мэдээлэл байхгүй байна'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredSalaries.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Хуудсанд:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>
      
      {/* Add Salary Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Шинэ цалингийн мэдээлэл</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Ажилтан</InputLabel>
                  <Select
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    label="Ажилтан"
                  >
                    {employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Үндсэн цалин"
                  name="base_salary"
                  type="number"
                  value={formData.base_salary}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₮</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Урамшуулал"
                  name="bonus"
                  type="number"
                  value={formData.bonus}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₮</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Нэмэгдэл"
                  name="allowance"
                  type="number"
                  value={formData.allowance}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₮</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Суутгал"
                  name="deductions"
                  type="number"
                  value={formData.deductions}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₮</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Хүчинтэй огноо"
                  name="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Тэмдэглэл"
                  name="notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
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
      
      {/* Edit Salary Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Цалингийн мэдээлэл засах</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Ажилтан</InputLabel>
                  <Select
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    label="Ажилтан"
                    disabled
                  >
                    {employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Үндсэн цалин"
                  name="base_salary"
                  type="number"
                  value={formData.base_salary}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₮</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Урамшуулал"
                  name="bonus"
                  type="number"
                  value={formData.bonus}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₮</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Нэмэгдэл"
                  name="allowance"
                  type="number"
                  value={formData.allowance}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₮</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Суутгал"
                  name="deductions"
                  type="number"
                  value={formData.deductions}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₮</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Хүчинтэй огноо"
                  name="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Тэмдэглэл"
                  name="notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
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
      
      {/* View Salary Dialog */}
      {selectedSalary && (
        <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <Typography variant="h6">
              Цалингийн мэдээллийн дэлгэрэнгүй
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Ажилтан:</Typography>
                  <Typography variant="body1">{selectedSalary.user_name}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Имэйл:</Typography>
                  <Typography variant="body1">{selectedSalary.user_email}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Хэлтэс:</Typography>
                  <Typography variant="body1">{selectedSalary.department || 'Тодорхойгүй'}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Хүчинтэй огноо:</Typography>
                  <Typography variant="body1">{formatDate(selectedSalary.effective_date)}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Үндсэн цалин:</Typography>
                  <Typography variant="body1">{formatCurrency(selectedSalary.base_salary)}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Урамшуулал:</Typography>
                  <Typography variant="body1">{formatCurrency(selectedSalary.bonus)}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Нэмэгдэл:</Typography>
                  <Typography variant="body1">{formatCurrency(selectedSalary.allowance)}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Суутгал:</Typography>
                  <Typography variant="body1">{formatCurrency(selectedSalary.deductions)}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Нийт цалин:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(calculateNetSalary(selectedSalary))}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Үүсгэсэн огноо:</Typography>
                  <Typography variant="body1">{formatDate(selectedSalary.created_at)}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Тэмдэглэл:</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {selectedSalary.notes || 'Тэмдэглэл байхгүй'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseViewDialog}>Хаах</Button>
            <Button 
              onClick={() => {
                handleCloseViewDialog();
                handleOpenEditDialog(selectedSalary);
              }} 
              color="primary"
              variant="contained"
            >
              Засах
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default SalaryManagement;
