import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Alert, CircularProgress, Grid,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField, 
  MenuItem, IconButton, Chip, TablePagination, InputAdornment,
  Tooltip, Tabs, Tab
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

// TabPanel component for tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`leave-tabpanel-${index}`}
      aria-labelledby={`leave-tab-${index}`}
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

const LeaveManagement = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredLeaveRequests, setFilteredLeaveRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Leave types
  const leaveTypes = {
    annual: 'Ээлжийн амралт',
    sick: 'Өвчний чөлөө',
    personal: 'Хувийн чөлөө',
    maternity: 'Жирэмсний амралт',
    paternity: 'Эцгийн амралт',
    other: 'Бусад'
  };
  
  // Status colors
  const statusColors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error'
  };
  
  // Status translations
  const statusTranslations = {
    pending: 'Хүлээгдэж буй',
    approved: 'Зөвшөөрсөн',
    rejected: 'Татгалзсан'
  };
  
  // Fetch leave requests
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        
        const res = await axios.get('/leave');
        setLeaveRequests(res.data);
        
        // Initial filtering based on tab
        filterLeaveRequestsByTab(res.data, tabValue);
        
      } catch (err) {
        console.error('Чөлөөний хүсэлтүүд ачааллахад алдаа гарлаа:', err);
        setError('Мэдээлэл ачааллахад алдаа гарлаа. Дахин оролдоно уу.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaveRequests();
  }, []);
  
  // Filter leave requests when tab or search term changes
  useEffect(() => {
    filterLeaveRequestsByTab(leaveRequests, tabValue);
  }, [tabValue, searchTerm, leaveRequests]);
  
  // Filter leave requests by tab and search term
  const filterLeaveRequestsByTab = (requests, tabIndex) => {
    let filtered = [...requests];
    
    // Filter by tab
    if (tabIndex === 1) {
      filtered = filtered.filter(leave => leave.status === 'pending');
    } else if (tabIndex === 2) {
      filtered = filtered.filter(leave => leave.status === 'approved');
    } else if (tabIndex === 3) {
      filtered = filtered.filter(leave => leave.status === 'rejected');
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(leave => 
        leave.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (leave.department && leave.department.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredLeaveRequests(filtered);
    setPage(0);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle view dialog
  const handleViewLeave = (leave) => {
    setSelectedLeave(leave);
    setViewDialog(true);
  };
  
  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedLeave(null);
  };
  
  // Approve leave request
  const handleApprove = async (id) => {
    try {
      setLoading(true);
      
      await axios.put(`/leave/${id}`, { status: 'approved' });
      
      // Update leave request in the list
      const updatedLeaveRequests = leaveRequests.map(leave => {
        if (leave.id === id) {
          return { ...leave, status: 'approved', approver_name: user.name };
        }
        return leave;
      });
      
      setLeaveRequests(updatedLeaveRequests);
      
      // Update selected leave if open
      if (selectedLeave && selectedLeave.id === id) {
        setSelectedLeave({ ...selectedLeave, status: 'approved', approver_name: user.name });
      }
      
      setSuccess('Чөлөөний хүсэлт амжилттай зөвшөөрөгдлөө');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Чөлөөний хүсэлт зөвшөөрөхөд алдаа гарлаа:', err);
      setError(err.response?.data?.message || 'Чөлөөний хүсэлт зөвшөөрөхөд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };
  
  // Reject leave request
  const handleReject = async (id) => {
    try {
      setLoading(true);
      
      await axios.put(`/leave/${id}`, { status: 'rejected' });
      
      // Update leave request in the list
      const updatedLeaveRequests = leaveRequests.map(leave => {
        if (leave.id === id) {
          return { ...leave, status: 'rejected', approver_name: user.name };
        }
        return leave;
      });
      
      setLeaveRequests(updatedLeaveRequests);
      
      // Update selected leave if open
      if (selectedLeave && selectedLeave.id === id) {
        setSelectedLeave({ ...selectedLeave, status: 'rejected', approver_name: user.name });
      }
      
      setSuccess('Чөлөөний хүсэлт амжилттай татгалзагдлаа');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Чөлөөний хүсэлт татгалзахад алдаа гарлаа:', err);
      setError(err.response?.data?.message || 'Чөлөөний хүсэлт татгалзахад алдаа гарлаа');
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
  
  // Calculate duration
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate difference in days
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays + ' өдөр';
  };
  
  // Handle pagination
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
        Чөлөөний удирдлага
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
          <Tab label="Хүлээгдэж буй" />
          <Tab label="Зөвшөөрөгдсөн" />
          <Tab label="Татгалзсан" />
        </Tabs>
      </Paper>
      
      {/* Search */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
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
      </Box>
      
      {/* Leave Requests Table */}
      <TabPanel value={tabValue} index={0}>
        <LeaveRequestsTable 
          leaveRequests={filteredLeaveRequests}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleViewLeave={handleViewLeave}
          handleApprove={handleApprove}
          handleReject={handleReject}
          formatDate={formatDate}
          calculateDuration={calculateDuration}
          leaveTypes={leaveTypes}
          statusColors={statusColors}
          statusTranslations={statusTranslations}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <LeaveRequestsTable 
          leaveRequests={filteredLeaveRequests}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleViewLeave={handleViewLeave}
          handleApprove={handleApprove}
          handleReject={handleReject}
          formatDate={formatDate}
          calculateDuration={calculateDuration}
          leaveTypes={leaveTypes}
          statusColors={statusColors}
          statusTranslations={statusTranslations}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <LeaveRequestsTable 
          leaveRequests={filteredLeaveRequests}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleViewLeave={handleViewLeave}
          handleApprove={handleApprove}
          handleReject={handleReject}
          formatDate={formatDate}
          calculateDuration={calculateDuration}
          leaveTypes={leaveTypes}
          statusColors={statusColors}
          statusTranslations={statusTranslations}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <LeaveRequestsTable 
          leaveRequests={filteredLeaveRequests}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleViewLeave={handleViewLeave}
          handleApprove={handleApprove}
          handleReject={handleReject}
          formatDate={formatDate}
          calculateDuration={calculateDuration}
          leaveTypes={leaveTypes}
          statusColors={statusColors}
          statusTranslations={statusTranslations}
        />
      </TabPanel>
      
      {/* View Leave Request Dialog */}
      {selectedLeave && (
        <Dialog open={viewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Чөлөөний хүсэлтийн дэлгэрэнгүй
              </Typography>
              <Chip 
                label={statusTranslations[selectedLeave.status] || selectedLeave.status} 
                color={statusColors[selectedLeave.status] || 'default'} 
              />
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Ажилтан:</Typography>
                  <Typography variant="body1">{selectedLeave.user_name}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Имэйл:</Typography>
                  <Typography variant="body1">{selectedLeave.user_email}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Хэлтэс:</Typography>
                  <Typography variant="body1">{selectedLeave.department || 'Тодорхойгүй'}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Төрөл:</Typography>
                  <Typography variant="body1">{leaveTypes[selectedLeave.type] || selectedLeave.type}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2">Эхлэх огноо:</Typography>
                  <Typography variant="body1">{formatDate(selectedLeave.start_date)}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2">Дуусах огноо:</Typography>
                  <Typography variant="body1">{formatDate(selectedLeave.end_date)}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2">Хугацаа:</Typography>
                  <Typography variant="body1">{calculateDuration(selectedLeave.start_date, selectedLeave.end_date)}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Шалтгаан:</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {selectedLeave.reason || 'Тодорхойгүй'}
                  </Typography>
                </Grid>
                
                {selectedLeave.status !== 'pending' && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Шийдвэрлэсэн:</Typography>
                    <Typography variant="body1">{selectedLeave.approver_name || user.name}</Typography>
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
              <>
                <Button 
                  onClick={() => {
                    handleReject(selectedLeave.id);
                    handleCloseViewDialog();
                  }} 
                  color="error"
                  startIcon={<RejectIcon />}
                >
                  Татгалзах
                </Button>
                
                <Button 
                  onClick={() => {
                    handleApprove(selectedLeave.id);
                    handleCloseViewDialog();
                  }} 
                  color="success"
                  variant="contained"
                  startIcon={<ApproveIcon />}
                >
                  Зөвшөөрөх
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

// Leave Requests Table Component
const LeaveRequestsTable = ({ 
  leaveRequests, 
  page, 
  rowsPerPage, 
  handleChangePage, 
  handleChangeRowsPerPage,
  handleViewLeave,
  handleApprove,
  handleReject,
  formatDate,
  calculateDuration,
  leaveTypes,
  statusColors,
  statusTranslations
}) => {
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>Ажилтан</TableCell>
              <TableCell>Хэлтэс</TableCell>
              <TableCell>Төрөл</TableCell>
              <TableCell>Эхлэх огноо</TableCell>
              <TableCell>Дуусах огноо</TableCell>
              <TableCell>Хугацаа</TableCell>
              <TableCell>Төлөв</TableCell>
              <TableCell>Үйлдэл</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaveRequests
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((leave) => (
                <TableRow hover key={leave.id}>
                  <TableCell>{leave.user_name}</TableCell>
                  <TableCell>{leave.department || '-'}</TableCell>
                  <TableCell>{leaveTypes[leave.type] || leave.type}</TableCell>
                  <TableCell>{formatDate(leave.start_date)}</TableCell>
                  <TableCell>{formatDate(leave.end_date)}</TableCell>
                  <TableCell>{calculateDuration(leave.start_date, leave.end_date)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={statusTranslations[leave.status] || leave.status} 
                      color={statusColors[leave.status] || 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Дэлгэрэнгүй">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleViewLeave(leave)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {leave.status === 'pending' && (
                      <>
                        <Tooltip title="Зөвшөөрөх">
                          <IconButton 
                            size="small" 
                            color="success" 
                            onClick={() => handleApprove(leave.id)}
                          >
                            <ApproveIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Татгалзах">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleReject(leave.id)}
                          >
                            <RejectIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            
            {leaveRequests.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
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
  );
};

export default LeaveManagement;
