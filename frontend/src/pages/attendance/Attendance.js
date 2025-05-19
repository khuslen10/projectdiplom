import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Alert, CircularProgress, Grid,
  Card, CardContent, Divider, TablePagination, FormControlLabel, Switch,
  Tooltip, Chip
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AccessTime as ClockIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const Attendance = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [officeLocation, setOfficeLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  
  // Хуудаслалт
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Add new state for remote check-in
  const [isRemote, setIsRemote] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  
  // Ирцийн мэдээлэл татах
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const latestRes = await axios.get('/attendance/latest');
        setAttendance(latestRes.data);
        const historyRes = await axios.get('/attendance/me');
        setAttendanceHistory(historyRes.data);
        const locationRes = await axios.get('/attendance/office-location');
        setOfficeLocation(locationRes.data);
        
      } catch (err) {
        console.error('Ирцийн мэдээлэл ачааллахад алдаа гарлаа:', err);
        setError('Мэдээлэл ачааллахад алдаа гарлаа. Дахин оролдоно уу.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendanceData();
  }, []);
  
  // Add new useEffect to fetch pending approvals
  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        // Try to get data from API, but have a fallback for when it fails
        try {
          const res = await axios.get('/attendance/my-pending');
          setPendingApprovals(res.data);
        } catch (err) {
          console.error('Хүлээгдэж буй ирцийн мэдээлэл татахад алдаа гарлаа:', err);
          // Use mock data if API fails
          setPendingApprovals([]);
        }
      } catch (err) {
        console.error('Хүлээгдэж буй ирцийн мэдээлэл боловсруулахад алдаа гарлаа:', err);
        setPendingApprovals([]);
      }
    };
    
    fetchPendingApprovals();
  }, []);
  
  // Одоогийн байршлыг авах
  const getCurrentLocation = () => {
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('Таны хөтөч байршил тогтоох боломжгүй байна');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.error('Байршил тогтооход алдаа гарлаа:', error);
        setLocationError('Байршил тогтооход алдаа гарлаа. Байршил тогтоох зөвшөөрөл олгоно уу.');
      }
    );
  };
  
  // Ирцийн бүртгэл хийх
  const handleCheckIn = async () => {
    if (!currentLocation) {
      getCurrentLocation();
      return;
    }
    
    try {
      setLoading(true);
      
      const res = await axios.post('/attendance/check-in', {
        ...currentLocation,
        isRemote
      });
      
      // Fetch the latest attendance data to ensure we have the correct structure
      const latestRes = await axios.get('/attendance/latest');
      setAttendance(latestRes.data);
      
      // Refresh the attendance history from the server
      const historyRes = await axios.get('/attendance/me');
      setAttendanceHistory(historyRes.data);
      
      // If remote, refresh pending approvals
      if (isRemote) {
        const pendingRes = await axios.get('/attendance/my-pending');
        setPendingApprovals(pendingRes.data);
      }
      
      // Keep the current location for checkout
      // setCurrentLocation(null);
      
    } catch (err) {
      console.error('Ирц бүртгэхэд алдаа гарлаа:', err);
      setError(err.response?.data?.message || 'Ирц бүртгэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };
  
  // Гарах бүртгэл хийх
  const handleCheckOut = async () => {
    if (!currentLocation) {
      getCurrentLocation();
      return;
    }
    
    try {
      setLoading(true);
      
      const res = await axios.post('/attendance/check-out', {
        ...currentLocation,
        attendanceId: attendance.id || attendance.attendanceId,
        isRemote
      });
      
      setAttendance({
        ...attendance,
        check_out: res.data.checkOutTime,
        check_out_location: `${currentLocation.latitude},${currentLocation.longitude}`,
        is_remote: attendance.is_remote || isRemote
      });
      
      const updatedHistory = attendanceHistory.map(item => {
        if (item.id === (attendance.id || attendance.attendanceId)) {
          return {
            ...item,
            check_out: res.data.checkOutTime,
            check_out_location: `${currentLocation.latitude},${currentLocation.longitude}`,
            is_remote: item.is_remote || isRemote
          };
        }
        return item;
      });
      
      setAttendanceHistory(updatedHistory);
      
      setCurrentLocation(null);
      
    } catch (err) {
      console.error('Гарах бүртгэл хийхэд алдаа гарлаа:', err);
      setError(err.response?.data?.message || 'Гарах бүртгэл хийхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };
  
  // Огноог форматлах
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('mn-MN');
  };
  
  // Хуудаслалт удирдах
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Ирцийн төлөв тооцоолох
  const getAttendanceStatus = (record) => {
    if (!record.check_in) return 'Бүртгэгдээгүй';
    if (!record.check_out) return 'Ажиллаж байна';
    
    const checkIn = new Date(record.check_in);
    const checkOut = new Date(record.check_out);
    
    // Calculate hours worked
    const hoursWorked = (checkOut - checkIn) / (1000 * 60 * 60);
    
    if (hoursWorked < 4) return 'Хагас өдөр';
    if (hoursWorked >= 8) return 'Бүтэн өдөр';
    return 'Дутуу цаг';
  };
  
  // Add getStatusChip method to display approval status
  const getStatusChip = (status) => {
    switch (status) {
      case 'approved':
        return <Chip color="success" size="small" label="Зөвшөөрөгдсөн" />;
      case 'rejected':
        return <Chip color="error" size="small" label="Татгалзсан" />;
      case 'pending':
        return <Chip color="warning" size="small" label="Хүлээгдэж байна" />;
      default:
        return null;
    }
  };
  
  if (loading && !attendanceHistory.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Ирц бүртгэл
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {locationError && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setLocationError(null)}>
          {locationError}
        </Alert>
      )}
      
      {/* Pending Approvals Section */}
      {pendingApprovals.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">
            Танд {pendingApprovals.length} ширхэг хүлээгдэж буй зайнаас ирцийн бүртгэл байна
          </Typography>
          <Typography variant="body2">
            Таны зайнаас бүртгүүлсэн ирцийг менежер баталгаажуулах хүртэл хүлээнэ үү
          </Typography>
        </Alert>
      )}
      
      {/* Today's Attendance Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <ClockIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Өнөөдрийн ирц
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  <strong>Ирсэн цаг:</strong> {attendance?.check_in ? formatDate(attendance.check_in) : 'Бүртгэгдээгүй'}
                  {attendance?.is_remote && attendance?.check_in && (
                    <Chip 
                      size="small" 
                      label="Зайнаас" 
                      color="info" 
                      sx={{ ml: 1 }}
                    />
                  )}
                  {attendance?.approval_status && attendance?.check_in && getStatusChip(attendance.approval_status)}
                </Typography>
                <Typography variant="body1">
                  <strong>Гарсан цаг:</strong> {attendance?.check_out ? formatDate(attendance.check_out) : 'Бүртгэгдээгүй'}
                </Typography>
                
                {officeLocation && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Оффисын байршил: {officeLocation.latitude.toFixed(6)}, {officeLocation.longitude.toFixed(6)}
                    (Зөвшөөрөгдөх зай: <span style={{ fontWeight: 'bold', color: 'green' }}>{officeLocation.allowedRadius}м</span>)
                  </Typography>
                )}
              </Box>
              
              {currentLocation && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Таны одоогийн байршил: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </Typography>
                </Alert>
              )}
              
              {/* Remote check-in option */}
              <FormControlLabel
                control={
                  <Switch 
                    checked={isRemote} 
                    onChange={(e) => setIsRemote(e.target.checked)} 
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2">Зайнаас ажиллаж байна</Typography>
                    <Tooltip title="Зайнаас ажиллаж байгаа тохиолдолд ирцийн бүртгэл менежерийн зөвшөөрлийг шаардана" arrow>
                      <InfoIcon fontSize="small" color="info" sx={{ ml: 0.5 }} />
                    </Tooltip>
                  </Box>
                }
                sx={{ mt: 2, mb: 1 }}
              />
              
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCheckIn}
                  disabled={loading || (attendance && attendance.check_in && !attendance.check_out)}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  Ирц бүртгэх
                </Button>
                
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCheckOut}
                  disabled={loading || !attendance || !attendance.check_in || attendance.check_out || !currentLocation}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  Гарах бүртгэл
                </Button>
                
                {!currentLocation && (
                  <Button
                    variant="text"
                    color="info"
                    onClick={getCurrentLocation}
                    startIcon={<LocationIcon />}
                    disabled={loading}
                  >
                    Байршил тогтоох
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Attendance History */}
      <Typography variant="h6" gutterBottom>
        Ирцийн түүх
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Огноо</TableCell>
              <TableCell>Ирсэн цаг</TableCell>
              <TableCell>Гарсан цаг</TableCell>
              <TableCell>Төлөв</TableCell>
              <TableCell>Төрөл</TableCell>
              <TableCell>Байршил</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.check_in ? new Date(record.check_in).toLocaleDateString('mn-MN') : ''}</TableCell>
                <TableCell>{record.check_in ? formatDate(record.check_in) : ''}</TableCell>
                <TableCell>{record.check_out ? formatDate(record.check_out) : 'Бүртгэгдээгүй'}</TableCell>
                <TableCell>{getAttendanceStatus(record)}</TableCell>
                <TableCell>
                  {record.is_remote ? (
                    <Chip size="small" label="Зайнаас" color="info" />
                  ) : (
                    <Chip size="small" label="Оффис" color="success" />
                  )}
                  {record.approval_status && getStatusChip(record.approval_status)}
                </TableCell>
                <TableCell>
                  {record.check_in_location && (
                    <Tooltip title={record.check_in_location} arrow>
                      <Button size="small" startIcon={<LocationIcon />} color="info">
                        Харах
                      </Button>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={attendanceHistory.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default Attendance;
