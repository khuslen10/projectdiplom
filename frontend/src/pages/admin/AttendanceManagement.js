import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Alert, CircularProgress, Grid,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField, 
  MenuItem, IconButton, Chip, TablePagination, InputAdornment,
  Tooltip, Tabs, Tab, FormControl, InputLabel, Select, Stack,
  Link
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CalendarMonth as CalendarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Settings as SettingsIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { mn as mnLocale } from 'date-fns/locale';

// Табын хувилбар компонент
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`attendance-tabpanel-${index}`}
      aria-labelledby={`attendance-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AttendanceManagement = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // Харилцах цонхны төлөв
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [locationDialog, setLocationDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Шүүлтүүрийн төлөв
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  
  // Оффисын байршлын тохиргоо
  const [officeLocation, setOfficeLocation] = useState({
    latitude: 0,
    longitude: 0,
    allowedRadius: 0
  });
  
  // Хуудаслалт
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Төлвийн өнгө
  const statusColors = {
    present: 'success',
    late: 'warning',
    absent: 'error',
    halfday: 'info'
  };
  
  // Төлвийн орчуулга
  const statusTranslations = {
    present: 'Ирсэн',
    late: 'Хоцорсон',
    absent: 'Ирээгүй',
    halfday: 'Хагас өдөр'
  };
  
  // Засварын маягтын өгөгдөл
  const [formData, setFormData] = useState({
    status: '',
    check_in: '',
    check_out: '',
    notes: ''
  });
  
  // Ирцийн бүртгэлүүдийг татах
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      try {
        setLoading(true);
        
        const res = await axios.get('/attendance');
        setAttendanceRecords(res.data);
        
        // Оффисын байршлын тохиргоог татах
        const locationRes = await axios.get('/attendance/office-location');
        setOfficeLocation(locationRes.data);
        
        // Давхардаагүй хэлтсүүдийг ялгах
        const uniqueDepartments = [...new Set(res.data
          .filter(record => record.department)
          .map(record => record.department))];
        
        setDepartments(uniqueDepartments);
        
        // Таб дээр суурилсан анхны шүүлт
        filterRecordsByTab(res.data, tabValue);
        
      } catch (err) {
        console.error('Ирцийн мэдээлэл ачааллахад алдаа гарлаа:', err);
        setError('Мэдээлэл ачааллахад алдаа гарлаа. Дахин оролдоно уу.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendanceRecords();
  }, []);
  
  // Таб, хайлтын үг, огноо эсвэл хэлтэс өөрчлөгдөхөд бүртгэлүүдийг шүүх
  useEffect(() => {
    filterRecordsByTab(attendanceRecords, tabValue);
  }, [tabValue, searchTerm, selectedDate, selectedDepartment, attendanceRecords]);
  
  // Таб, хайлтын үг, огноо болон хэлтсээр бүртгэлүүдийг шүүх
  const filterRecordsByTab = (records, tabIndex) => {
    if (!records || !Array.isArray(records)) {
      setFilteredRecords([]);
      return;
    }
    
    let filtered = [...records];
    
    // Хэрэв байхгүй бол бүртгэл бүрт огнооны шинж нэмэх
    filtered = filtered.map(record => {
      if (!record.date && record.check_in) {
        try {
          const checkInDate = new Date(record.check_in);
          // Check if valid date before calling toISOString()
          if (!isNaN(checkInDate.getTime())) {
            return { ...record, date: checkInDate.toISOString().split('T')[0] };
          }
        } catch (err) {
          console.warn('Invalid date for record:', record);
        }
      }
      return record;
    });
    
    // Filter by tab
    if (tabIndex === 1) {
      filtered = filtered.filter(record => record.status === 'present');
    } else if (tabIndex === 2) {
      filtered = filtered.filter(record => record.status === 'late');
    } else if (tabIndex === 3) {
      filtered = filtered.filter(record => record.status === 'absent');
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(record => 
        (record.user_name && record.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.user_email && record.user_email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by date
    if (selectedDate) {
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        filtered = filtered.filter(record => {
          if (!record.date && !record.check_in) return false;
          
          try {
            const recordDate = record.date || 
              (record.check_in ? new Date(record.check_in).toISOString().split('T')[0] : null);
            return recordDate === dateStr;
          } catch (err) {
            return false;
          }
        });
      } catch (err) {
        console.warn('Error filtering by date:', err);
      }
    }
    
    // Filter by department
    if (selectedDepartment) {
      filtered = filtered.filter(record => record.department === selectedDepartment);
    }
    
    setFilteredRecords(filtered);
    setPage(0);
  };
  
  // Хайлтын оролтын өөрчлөлтийг удирдах
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Табын өөрчлөлтийг удирдах
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Огнооны өөрчлөлтийг удирдах
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };
  
  // Хэлтсийн өөрчлөлтийг удирдах
  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };
  
  // Шүүлтүүрүүдийг дахин тохируулах
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDate(null);
    setSelectedDepartment('');
  };
  
  // Харах харилцах цонхыг удирдах
  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setViewDialog(true);
  };
  
  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedRecord(null);
  };
  
  // Засах харилцах цонхыг удирдах
  const handleOpenEditDialog = (record) => {
    setSelectedRecord(record);
    setFormData({
      status: record.status,
      check_in: record.check_in || '',
      check_out: record.check_out || '',
      notes: record.notes || ''
    });
    setEditDialog(true);
  };
  
  const handleCloseEditDialog = () => {
    setEditDialog(false);
    setSelectedRecord(null);
  };
  
  // Маягтын өөрчлөлтийг удирдах
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Засварын маягтыг илгээх
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await axios.put(`/attendance/${selectedRecord.id}`, formData);
      
      // Update record in the list
      const updatedRecords = attendanceRecords.map(record => {
        if (record.id === selectedRecord.id) {
          return { ...record, ...formData };
        }
        return record;
      });
      
      setAttendanceRecords(updatedRecords);
      
      // Close dialog and show success message
      handleCloseEditDialog();
      setSuccess('Ирцийн мэдээлэл амжилттай шинэчлэгдлээ');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Ирцийн мэдээлэл шинэчлэхэд алдаа гарлаа:', err);
      setError(err.response?.data?.message || 'Ирцийн мэдээлэл шинэчлэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };
  
  // Ирцийн бүртгэлийг устгах
  const handleDeleteRecord = async () => {
    try {
      setLoading(true);
      
      await axios.delete(`/attendance/${selectedRecord.id}`);
      
      // Remove record from the list
      const updatedRecords = attendanceRecords.filter(record => record.id !== selectedRecord.id);
      setAttendanceRecords(updatedRecords);
      
      // Close dialog and show success message
      setDeleteDialog(false);
      setSelectedRecord(null);
      setSuccess('Ирцийн бүртгэл амжилттай устгагдлаа');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Ирцийн бүртгэл устгахад алдаа гарлаа:', err);
      setError(err.response?.data?.message || 'Ирцийн бүртгэл устгахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };
  
  // Оффисын байршлын тохиргоог шинэчлэх
  const handleUpdateLocation = async () => {
    try {
      setLoading(true);
      
      await axios.put('/attendance/office-location', officeLocation);
      
      // Close dialog and show success message
      setLocationDialog(false);
      setSuccess('Оффисын байршил амжилттай шинэчлэгдлээ');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Оффисын байршил шинэчлэхэд алдаа гарлаа:', err);
      setError(err.response?.data?.message || 'Оффисын байршил шинэчлэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };
  
  // Оффисын байршлын тохиргооны өөрчлөлтийг удирдах
  const handleLocationChange = (e) => {
    setOfficeLocation({
      ...officeLocation,
      [e.target.name]: parseFloat(e.target.value)
    });
  };
  
  // Огноог форматлах
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };
  
  // Цагийг форматлах
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    
    // If it's a full ISO date string, extract the time part
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
    }
    
    // If it's already a time string, return it
    return timeString;
  };
  
  // Хуудаслалтыг удирдах
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  if (loading && !attendanceRecords.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Ирцийн удирдлага
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SettingsIcon />}
          onClick={() => setLocationDialog(true)}
        >
          Оффисын байршил тохируулах
        </Button>
      </Box>
      
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
      
      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Бүгд" />
          <Tab label="Ирсэн" />
          <Tab label="Хоцорсон" />
          <Tab label="Ирээгүй" />
        </Tabs>
      </Paper>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={3}>
            <TextField
              placeholder="Хайх..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={mnLocale}>
              <DatePicker
                label="Огноо"
                value={selectedDate}
                onChange={handleDateChange}
                slotProps={{ 
                  textField: { 
                    size: 'small', 
                    fullWidth: true 
                  } 
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Хэлтэс</InputLabel>
              <Select
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                label="Хэлтэс"
              >
                <MenuItem value="">
                  <em>Бүгд</em>
                </MenuItem>
                {departments.map((department) => (
                  <MenuItem key={department} value={department}>
                    {department}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid xs={12} md={3}>
            <Button 
              variant="outlined" 
              onClick={handleResetFilters}
              fullWidth
            >
              Шүүлтүүр цэвэрлэх
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Attendance Records Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Ажилтан</TableCell>
                <TableCell>Хэлтэс</TableCell>
                <TableCell>Огноо</TableCell>
                <TableCell>Ирсэн цаг</TableCell>
                <TableCell>Явсан цаг</TableCell>
                <TableCell>Төлөв</TableCell>
                <TableCell>Үйлдэл</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((record) => (
                  <TableRow hover key={record.id}>
                    <TableCell>{record.name || '-'}</TableCell>
                    <TableCell>{record.department || '-'}</TableCell>
                    <TableCell>{formatDate(record.check_in)}</TableCell>
                    <TableCell>{formatTime(record.check_in)}</TableCell>
                    <TableCell>{formatTime(record.check_out)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={statusTranslations[record.status] || record.status} 
                        color={statusColors[record.status] || 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Дэлгэрэнгүй">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleViewRecord(record)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Засах">
                        <IconButton 
                          size="small" 
                          color="secondary" 
                          onClick={() => handleOpenEditDialog(record)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Устгах">
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => {
                            setSelectedRecord(record);
                            setDeleteDialog(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              
              {filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Ирцийн мэдээлэл олдсонгүй
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRecords.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Хуудсанд:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>
      
      {/* View Record Dialog */}
      {selectedRecord && (
        <Dialog open={viewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Ирцийн дэлгэрэнгүй
              </Typography>
              <Chip 
                label={statusTranslations[selectedRecord.status] || selectedRecord.status} 
                color={statusColors[selectedRecord.status] || 'default'} 
              />
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid xs={12} md={6}>
                  <Typography variant="subtitle2">Ажилтан:</Typography>
                  <Typography variant="body1">{selectedRecord.user_name}</Typography>
                </Grid>
                
                <Grid xs={12} md={6}>
                  <Typography variant="subtitle2">Имэйл:</Typography>
                  <Typography variant="body1">{selectedRecord.user_email}</Typography>
                </Grid>
                
                <Grid xs={12} md={6}>
                  <Typography variant="subtitle2">Хэлтэс:</Typography>
                  <Typography variant="body1">{selectedRecord.department || 'Тодорхойгүй'}</Typography>
                </Grid>
                
                <Grid xs={12} md={6}>
                  <Typography variant="subtitle2">Огноо:</Typography>
                  <Typography variant="body1">{formatDate(selectedRecord.date)}</Typography>
                </Grid>
                
                <Grid xs={12} md={6}>
                  <Typography variant="subtitle2">Ирсэн цаг:</Typography>
                  <Typography variant="body1">{formatTime(selectedRecord.check_in) || 'Бүртгэгдээгүй'}</Typography>
                </Grid>
                
                <Grid xs={12} md={6}>
                  <Typography variant="subtitle2">Явсан цаг:</Typography>
                  <Typography variant="body1">{formatTime(selectedRecord.check_out) || 'Бүртгэгдээгүй'}</Typography>
                </Grid>
                
                <Grid xs={12}>
                  <Typography variant="subtitle2">Тэмдэглэл:</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {selectedRecord.notes || 'Тэмдэглэл байхгүй'}
                  </Typography>
                </Grid>
                
                <Grid xs={12}>
                  <Typography variant="subtitle2">Байршил:</Typography>
                  <Typography variant="body1">
                    {selectedRecord.location ? `${selectedRecord.location.latitude}, ${selectedRecord.location.longitude}` : 'Бүртгэгдээгүй'}
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
                handleOpenEditDialog(selectedRecord);
              }} 
              color="primary"
              variant="contained"
            >
              Засах
            </Button>
          </DialogActions>
        </Dialog>
      )}
      
      {/* Edit Record Dialog */}
      {selectedRecord && (
        <Dialog open={editDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Ирцийн мэдээлэл засах</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Төлөв"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {Object.entries(statusTranslations).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ирсэн цаг"
                    name="check_in"
                    type="time"
                    value={formData.check_in}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                  />
                </Grid>
                
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Явсан цаг"
                    name="check_out"
                    type="time"
                    value={formData.check_out}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                  />
                </Grid>
                
                <Grid xs={12}>
                  <TextField
                    fullWidth
                    label="Тэмдэглэл"
                    name="notes"
                    multiline
                    rows={4}
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
              color="primary" 
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Хадгалах'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="sm">
        <DialogTitle>Ирцийн бүртгэл устгах</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Та энэ ирцийн бүртгэлийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Цуцлах</Button>
          <Button 
            onClick={handleDeleteRecord} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Устгах'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Office Location Settings Dialog */}
      <Dialog open={locationDialog} onClose={() => setLocationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Оффисын байршил тохируулах</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Өргөрөг (Latitude)"
                  name="latitude"
                  type="number"
                  value={officeLocation.latitude}
                  onChange={handleLocationChange}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 0.000001 }}
                />
              </Grid>
              
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Уртраг (Longitude)"
                  name="longitude"
                  type="number"
                  value={officeLocation.longitude}
                  onChange={handleLocationChange}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 0.000001 }}
                />
              </Grid>
              
              <Grid xs={12}>
                <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    startIcon={<MapIcon />}
                    component={Link}
                    href={`https://maps.google.com/?q=${officeLocation.latitude},${officeLocation.longitude}`}
                    target="_blank"
                    fullWidth
                  >
                    Газрын зураг дээр харах
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Шинэ байршил сонгохдоо Google Maps дээр дарж →
                    координатыг (lat, lng) хуулан энд буцаж оруулна уу
                  </Typography>
                </Box>
              </Grid>
              
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Зөвшөөрөгдөх радиус (метр)"
                  name="allowedRadius"
                  type="number"
                  value={officeLocation.allowedRadius}
                  onChange={handleLocationChange}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 100, min: 10, max: 5000 }}
                  helperText="Оффисоос хэр хол зайд ирцийг бүртгэх боломжтой байхыг заана (10-5000 метр)"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocationDialog(false)}>Цуцлах</Button>
          <Button 
            onClick={handleUpdateLocation} 
            color="primary" 
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

export default AttendanceManagement;
