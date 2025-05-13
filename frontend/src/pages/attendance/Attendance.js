import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Alert, CircularProgress, Grid,
  Card, CardContent, Divider, TablePagination
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AccessTime as ClockIcon
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
      
      const res = await axios.post('/attendance/check-in', currentLocation);
      
      setAttendance({
        ...res.data,
        check_in: res.data.checkInTime,
        check_in_location: `${currentLocation.latitude},${currentLocation.longitude}`
      });
      
      // Түүхэнд нэмэх
      setAttendanceHistory([
        {
          id: res.data.attendanceId,
          check_in: res.data.checkInTime,
          check_in_location: `${currentLocation.latitude},${currentLocation.longitude}`,
          user_id: user.id
        },
        ...attendanceHistory
      ]);
      
      // Ирцийн бүртгэлийн дараа байршлыг дахин тохируулах
      setCurrentLocation(null);
      
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
        attendanceId: attendance.id || attendance.attendanceId
      });
      
      setAttendance({
        ...attendance,
        check_out: res.data.checkOutTime,
        check_out_location: `${currentLocation.latitude},${currentLocation.longitude}`
      });
      
      
      const updatedHistory = attendanceHistory.map(item => {
        if (item.id === (attendance.id || attendance.attendanceId)) {
          return {
            ...item,
            check_out: res.data.checkOutTime,
            check_out_location: `${currentLocation.latitude},${currentLocation.longitude}`
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
                </Typography>
                <Typography variant="body1">
                  <strong>Гарсан цаг:</strong> {attendance?.check_out ? formatDate(attendance.check_out) : 'Бүртгэгдээгүй'}
                </Typography>
                
                {officeLocation && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Оффисын байршил: {officeLocation.latitude.toFixed(6)}, {officeLocation.longitude.toFixed(6)}
                    (Зөвшөөрөгдөх зай: {officeLocation.allowedRadius}м)
                  </Typography>
                )}
              </Box>
              
              {currentLocation && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Одоогийн байршил: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </Typography>
                </Alert>
              )}
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCheckIn}
                disabled={loading || (attendance && !attendance.check_out && attendance.check_in)}
                sx={{ mr: 2 }}
              >
                Ирц бүртгэх
              </Button>
              
              <Button
                variant="contained"
                color="secondary"
                onClick={handleCheckOut}
                disabled={loading || !attendance || !attendance.check_in || attendance.check_out}
              >
                Гарах бүртгэл
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Attendance History */}
      <Typography variant="h6" gutterBottom>
        Ирцийн түүх
      </Typography>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Огноо</TableCell>
                <TableCell>Ирсэн цаг</TableCell>
                <TableCell>Гарсан цаг</TableCell>
                <TableCell>Төлөв</TableCell>
                <TableCell>Тайлбар</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceHistory
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((record) => (
                  <TableRow hover key={record.id}>
                    <TableCell>
                      {record.check_in ? new Date(record.check_in).toLocaleDateString('mn-MN') : ''}
                    </TableCell>
                    <TableCell>{record.check_in ? formatDate(record.check_in) : ''}</TableCell>
                    <TableCell>{record.check_out ? formatDate(record.check_out) : ''}</TableCell>
                    <TableCell>{getAttendanceStatus(record)}</TableCell>
                    <TableCell>{record.notes || ''}</TableCell>
                  </TableRow>
                ))}
              
              {attendanceHistory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Ирцийн түүх хоосон байна
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={attendanceHistory.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Хуудсанд:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>
    </Box>
  );
};

export default Attendance;
