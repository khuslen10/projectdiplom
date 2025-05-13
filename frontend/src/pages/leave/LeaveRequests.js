import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Alert, CircularProgress, Grid,
  Card, CardContent, Dialog, DialogActions, DialogContent, 
  DialogTitle, TextField, MenuItem, IconButton, Chip, TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const LeaveRequests = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  
  // Маягтын өгөгдөл
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    type: 'annual',
    reason: ''
  });
  
  // Маягтын алдаанууд
  const [formErrors, setFormErrors] = useState({});
  
  // Хуудаслалт
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Чөлөөний төрлүүд
  const leaveTypes = [
    { value: 'annual', label: 'Ээлжийн амралт' },
    { value: 'sick', label: 'Өвчний чөлөө' },
    { value: 'personal', label: 'Хувийн чөлөө' },
    { value: 'maternity', label: 'Жирэмсний амралт' },
    { value: 'paternity', label: 'Эцгийн амралт' },
    { value: 'other', label: 'Бусад' }
  ];
  
  // Төлвийн өнгө
  const statusColors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error'
  };
  
  // Төлвийн орчуулга
  const statusTranslations = {
    pending: 'Хүлээгдэж буй',
    approved: 'Зөвшөөрсөн',
    rejected: 'Татгалзсан'
  };
  
  // Чөлөөний хүсэлтүүдийг татах
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        
        const res = await axios.get('/leave/me');
        setLeaveRequests(res.data);
        
      } catch (err) {
        console.error('Чөлөөний хүсэлтүүд ачааллахад алдаа гарлаа:', err);
        setError('Мэдээлэл ачааллахад алдаа гарлаа. Дахин оролдоно уу.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaveRequests();
  }, []);
  
  // Харилцах цонхыг нээх/хаах
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      start_date: '',
      end_date: '',
      type: 'annual',
      reason: ''
    });
    setFormErrors({});
  };
  
  // Харах харилцах цонхыг удирдах
  const handleViewLeave = (leave) => {
    setSelectedLeave(leave);
    setViewDialog(true);
  };
  
  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedLeave(null);
  };
  
  // Маягтын өөрчлөлтийг удирдах
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Бичих үед алдааг арилгах
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };
  
  // Маягтыг шалгах
  const validateForm = () => {
    const errors = {};
    
    if (!formData.start_date) {
      errors.start_date = 'Эхлэх огноо оруулна уу';
    }
    
    if (!formData.end_date) {
      errors.end_date = 'Дуусах огноо оруулна уу';
    } else if (formData.end_date < formData.start_date) {
      errors.end_date = 'Дуусах огноо нь эхлэх огнооноос хойш байх ёстой';
    }
    
    if (!formData.type) {
      errors.type = 'Чөлөөний төрөл сонгоно уу';
    }
    
    if (!formData.reason) {
      errors.reason = 'Шалтгаан оруулна уу';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Чөлөөний хүсэлтийг илгээх
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const res = await axios.post('/leave', formData);
      const newLeave = {
        id: res.data.leaveId,
        user_id: user.id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        type: formData.type,
        reason: formData.reason,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      setLeaveRequests([newLeave, ...leaveRequests]);
      handleCloseDialog();
      setSuccess('Чөлөөний хүсэлт амжилттай илгээгдлээ');
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Чөлөөний хүсэлт илгээхэд алдаа гарлаа:', err);
      setError(err.response?.data?.message || 'Чөлөөний хүсэлт илгээхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Та энэ чөлөөний хүсэлтийг устгахдаа итгэлтэй байна уу?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      await axios.delete(`/leave/${id}`);
      setLeaveRequests(leaveRequests.filter(leave => leave.id !== id));
      
      setSuccess('Чөлөөний хүсэлт амжилттай устгагдлаа');
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Чөлөөний хүсэлт устгахад алдаа гарлаа:', err);
      setError(err.response?.data?.message || 'Чөлөөний хүсэлт устгахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };
  
  // Огноог форматлах
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('mn-MN');
  };
  
  // Чөлөөний төрлийн текстийг авах
  const getLeaveTypeLabel = (type) => {
    const leaveType = leaveTypes.find(t => t.value === type);
    return leaveType ? leaveType.label : type;
  };
  
  // Хуудаслалтыг удирдах
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  if (loading && !leaveRequests.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Чөлөөний хүсэлтүүд
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
      
      {/* Action Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Шинэ хүсэлт үүсгэх
        </Button>
      </Box>
      
      {/* Leave Requests Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Эхлэх огноо</TableCell>
                <TableCell>Дуусах огноо</TableCell>
                <TableCell>Төрөл</TableCell>
                <TableCell>Төлөв</TableCell>
                <TableCell>Үүсгэсэн огноо</TableCell>
                <TableCell>Үйлдэл</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveRequests
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((leave) => (
                  <TableRow hover key={leave.id}>
                    <TableCell>{formatDate(leave.start_date)}</TableCell>
                    <TableCell>{formatDate(leave.end_date)}</TableCell>
                    <TableCell>{getLeaveTypeLabel(leave.type)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={statusTranslations[leave.status] || leave.status} 
                        color={statusColors[leave.status] || 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{formatDate(leave.created_at)}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleViewLeave(leave)}
                      >
                        <ViewIcon />
                      </IconButton>
                      
                      {leave.status === 'pending' && (
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDelete(leave.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              
              {leaveRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Чөлөөний хүсэлт байхгүй байна
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={leaveRequests.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Хуудсанд:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>
      
      {/* Create Leave Request Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Шинэ чөлөөний хүсэлт үүсгэх</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="start_date"
                  label="Эхлэх огноо"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  error={!!formErrors.start_date}
                  helperText={formErrors.start_date}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="end_date"
                  label="Дуусах огноо"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange}
                  error={!!formErrors.end_date}
                  helperText={formErrors.end_date}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="type"
                  label="Чөлөөний төрөл"
                  name="type"
                  select
                  value={formData.type}
                  onChange={handleChange}
                  error={!!formErrors.type}
                  helperText={formErrors.type}
                >
                  {leaveTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="reason"
                  label="Шалтгаан"
                  name="reason"
                  multiline
                  rows={4}
                  value={formData.reason}
                  onChange={handleChange}
                  error={!!formErrors.reason}
                  helperText={formErrors.reason}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Цуцлах</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Илгээх'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* View Leave Request Dialog */}
      {selectedLeave && (
        <Dialog open={viewDialog} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Чөлөөний хүсэлтийн дэлгэрэнгүй</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Эхлэх огноо:</Typography>
                  <Typography variant="body1">{formatDate(selectedLeave.start_date)}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Дуусах огноо:</Typography>
                  <Typography variant="body1">{formatDate(selectedLeave.end_date)}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Төрөл:</Typography>
                  <Typography variant="body1">{getLeaveTypeLabel(selectedLeave.type)}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Төлөв:</Typography>
                  <Chip 
                    label={statusTranslations[selectedLeave.status] || selectedLeave.status} 
                    color={statusColors[selectedLeave.status] || 'default'} 
                    size="small" 
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Шалтгаан:</Typography>
                  <Typography variant="body1">{selectedLeave.reason}</Typography>
                </Grid>
                
                {selectedLeave.approver_name && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Шийдвэрлэсэн:</Typography>
                    <Typography variant="body1">{selectedLeave.approver_name}</Typography>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Үүсгэсэн огноо:</Typography>
                  <Typography variant="body1">{formatDate(selectedLeave.created_at)}</Typography>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseViewDialog}>Хаах</Button>
            
            {selectedLeave.status === 'pending' && (
              <Button 
                onClick={() => {
                  handleDelete(selectedLeave.id);
                  handleCloseViewDialog();
                }} 
                color="error"
              >
                Устгах
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default LeaveRequests;
