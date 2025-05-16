import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, TextField, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress, Grid, Tooltip
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  AccessTime as PendingIcon,
  PersonPin as UserIcon,
  LocationOn as LocationIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const ApprovalDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [action, setAction] = useState('');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/attendance/pending-approvals');
      setPendingApprovals(response.data);
    } catch (err) {
      console.error('Error fetching pending approvals:', err);
      setError('Баталгаажуулалт хүлээж буй ирцийн мэдээлэл татахад алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPendingApprovals();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchPendingApprovals();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleApproveClick = (attendance) => {
    setCurrentAttendance(attendance);
    setAction('approved');
    setNotes('');
    setOpenDialog(true);
  };
  
  const handleRejectClick = (attendance) => {
    setCurrentAttendance(attendance);
    setAction('rejected');
    setNotes('');
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentAttendance(null);
  };
  
  const handleSubmit = async () => {
    try {
      setProcessing(true);
      
      await axios.put(`/attendance/approve/${currentAttendance.id}`, {
        action,
        notes
      });
      
      // Update the local state
      setPendingApprovals(pendingApprovals.filter(item => item.id !== currentAttendance.id));
      
      setSuccess(`Ирцийн бүртгэл амжилттай ${action === 'approved' ? 'зөвшөөрөгдлөө' : 'татгалзагдлаа'}`);
      handleCloseDialog();
      
    } catch (err) {
      console.error('Error processing approval:', err);
      setError('Ирцийн баталгаажуулалт хийхэд алдаа гарлаа.');
    } finally {
      setProcessing(false);
    }
  };
  
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('mn-MN');
  };
  
  const formatLocation = (locationString) => {
    if (!locationString) return 'Байршил бүртгэгдээгүй';
    const [lat, lng] = locationString.split(',');
    return `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`;
  };
  
  if (loading && !pendingApprovals.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Ирцийн Баталгаажуулалт
      </Typography>
      
      <Typography variant="body1" paragraph>
        Энэ хэсэгт зайнаас бүртгүүлсэн ирцийг баталгаажуулах эсвэл татгалзах боломжтой. 
        Зөвхөн таны удирдлаган дор ажилладаг ажилтнуудын ирц л энд харагдана.
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
      
      {pendingApprovals.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <PendingIcon color="action" sx={{ fontSize: 60, opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            Одоогоор баталгаажуулалт хүлээж буй ирцийн бүртгэл байхгүй байна
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ажилтан</TableCell>
                <TableCell>Ирсэн цаг</TableCell>
                <TableCell>Гарсан цаг</TableCell>
                <TableCell>Байршил</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="center">Үйлдэл</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingApprovals.map((attendance) => (
                <TableRow key={attendance.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <UserIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {attendance.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {attendance.department}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{formatDateTime(attendance.check_in)}</TableCell>
                  <TableCell>{formatDateTime(attendance.check_out) || 'Бүртгэгдээгүй'}</TableCell>
                  <TableCell>
                    <Tooltip title="Газрын зураг дээр харах" arrow>
                      <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <LocationIcon sx={{ mr: 0.5, fontSize: '0.9rem', color: 'secondary.main' }} />
                        <Typography variant="body2">
                          {formatLocation(attendance.check_in_location)}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={<PendingIcon />} 
                      label="Хүлээгдэж буй" 
                      size="small"
                      color="warning"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip title="Зөвшөөрөх" arrow>
                        <IconButton 
                          color="success" 
                          onClick={() => handleApproveClick(attendance)}
                        >
                          <ApproveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Татгалзах" arrow>
                        <IconButton 
                          color="error" 
                          onClick={() => handleRejectClick(attendance)}
                        >
                          <RejectIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Approve/Reject Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {action === 'approved' ? 'Ирцийг зөвшөөрөх' : 'Ирцийг татгалзах'}
        </DialogTitle>
        <DialogContent>
          {currentAttendance && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Ажилтан:</Typography>
                  <Typography variant="body1">{currentAttendance.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Хэлтэс:</Typography>
                  <Typography variant="body1">{currentAttendance.department}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Ирсэн цаг:</Typography>
                  <Typography variant="body1">{formatDateTime(currentAttendance.check_in)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Гарсан цаг:</Typography>
                  <Typography variant="body1">
                    {formatDateTime(currentAttendance.check_out) || 'Бүртгэгдээгүй'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Байршил:</Typography>
                  <Typography variant="body1">
                    {formatLocation(currentAttendance.check_in_location)}
                  </Typography>
                </Grid>
              </Grid>
              
              <TextField
                label="Тэмдэглэл"
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={action === 'approved' ? "Нэмэлт тэмдэглэл (заавал биш)" : "Татгалзсан шалтгаан (заавал биш)"}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={processing}>
            Цуцлах
          </Button>
          <Button 
            onClick={handleSubmit} 
            color={action === 'approved' ? 'success' : 'error'} 
            variant="contained"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : null}
          >
            {action === 'approved' ? 'Зөвшөөрөх' : 'Татгалзах'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApprovalDashboard; 