import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, Grid, Paper, Typography, Button, Card, CardContent, 
  CardActions, Divider, CircularProgress, Alert, FormControlLabel, Switch, Chip
} from '@mui/material';
import {
  AccessTime as ClockIcon,
  EventAvailable as LeaveIcon,
  Assessment as PerformanceIcon,
  AttachMoney as SalaryIcon,
  LocationOn as LocationIcon,
  InsertChart as ChartIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import Analytics from '../../components/Analytics';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [officeLocation, setOfficeLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isRemoteWork, setIsRemoteWork] = useState(false);
  
  // Хянах самбарын мэдээлэл татах
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        
        const attendanceRes = await axios.get('/attendance/latest');
        setAttendance(attendanceRes.data);
        const leavesRes = await axios.get('/leave/me');
        const pending = leavesRes.data.filter(leave => leave.status === 'pending').length;
        setPendingLeaves(pending);
        const reviewsRes = await axios.get('/performance/me');
        const pendingReviews = reviewsRes.data.filter(
          review => review.status === 'submitted' && !review.acknowledged
        ).length;
        setPendingReviews(pendingReviews);
        const locationRes = await axios.get('/attendance/office-location');
        setOfficeLocation(locationRes.data);
        
      } catch (err) {
        console.error('Хянах самбарын мэдээлэл ачааллахад алдаа гарлаа:', err);
        setError('Мэдээлэл ачааллахад алдаа гарлаа. Дахин оролдоно уу.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
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
        isRemote: isRemoteWork
      });
      
      setAttendance(res.data);
      
      // Refresh attendance history to get the latest record
      const latestAttendanceRes = await axios.get('/attendance/latest');
      setAttendance(latestAttendanceRes.data);
      
      // If remote, refresh pending approvals
      if (isRemoteWork) {
        const pendingRes = await axios.get('/attendance/my-pending');
        setPendingLeaves(pendingRes.data.length);
      }
      
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
        attendanceId: attendance.id || attendance.attendanceId,
        isRemote: isRemoteWork
      });
      
      setAttendance({
        ...attendance,
        check_out: res.data.checkOutTime,
        check_out_location: `${currentLocation.latitude},${currentLocation.longitude}`
      });
      
      // After successful check-out, fetch the latest attendance record to update UI
      const latestAttendanceRes = await axios.get('/attendance/latest');
      setAttendance(latestAttendanceRes.data);
      
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
  
  // Check if attendance is from a previous day
  const isAttendanceFromPreviousDay = () => {
    if (!attendance?.check_in) return true;
    
    const today = new Date();
    const checkInDate = new Date(attendance.check_in);
    
    return today.toDateString() !== checkInDate.toDateString();
  };
  
  if (loading && !attendance) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Сайн байна уу, {user?.name}!
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {locationError && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 0 }} onClose={() => setLocationError(null)}>
          {locationError}
        </Alert>
      )}
      
      {/* Attendance Card */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 0 }}>
        <Typography variant="h6" gutterBottom>
          <ClockIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Өнөөдрийн ирц
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid sx={{ width: { xs: '100%', md: '50%' }, p: 1 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                <strong>Ирсэн цаг:</strong> {attendance?.check_in ? formatDate(attendance.check_in) : 'Бүртгэгдээгүй'}
              </Typography>
              <Typography variant="body1">
                <strong>Гарсан цаг:</strong> {attendance?.check_out ? formatDate(attendance.check_out) : 'Бүртгэгдээгүй'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid sx={{ width: { xs: '100%', md: '50%' }, p: 1, textAlign: 'right' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ClockIcon />}
              onClick={() => navigate('/dashboard/attendance')}
            >
              Ирц бүртгэлийн хуудас руу
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Quick Access Cards */}
      <Typography variant="h6" gutterBottom>
        Хурдан хандалт
      </Typography>
      
      <Grid container spacing={3}>
        {/* Leave Requests */}
        <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1.5 }}>
          <Card sx={{ borderRadius: 0 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <LeaveIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Чөлөөний хүсэлт
              </Typography>
              <Typography variant="body1">
                {pendingLeaves > 0 ? (
                  `${pendingLeaves} хүлээгдэж буй хүсэлт байна`
                ) : (
                  'Хүлээгдэж буй хүсэлт байхгүй'
                )}
              </Typography>
            </CardContent>
            <Divider />
            <CardActions>
              <Button size="small" onClick={() => navigate('/dashboard/leave')}>
                Дэлгэрэнгүй
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Performance Reviews */}
        <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1.5 }}>
          <Card sx={{ borderRadius: 0 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PerformanceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Гүйцэтгэлийн үнэлгээ
              </Typography>
              <Typography variant="body1">
                {pendingReviews > 0 ? (
                  `${pendingReviews} баталгаажуулаагүй үнэлгээ байна`
                ) : (
                  'Баталгаажуулаагүй үнэлгээ байхгүй'
                )}
              </Typography>
            </CardContent>
            <Divider />
            <CardActions>
              <Button size="small" onClick={() => navigate('/dashboard/performance')}>
                Дэлгэрэнгүй
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Salary Information */}
        <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1.5 }}>
          <Card sx={{ borderRadius: 0 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SalaryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Цалингийн мэдээлэл
              </Typography>
              <Typography variant="body1">
                Цалингийн дэлгэрэнгүй мэдээлэл харах
              </Typography>
            </CardContent>
            <Divider />
            <CardActions>
              <Button size="small" onClick={() => navigate('/dashboard/salary')}>
                Дэлгэрэнгүй
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Reports */}
        <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1.5 }}>
          <Card sx={{ borderRadius: 0 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Тайлан, статистик
              </Typography>
              <Typography variant="body1">
                Ирц, гүйцэтгэл, цалингийн тайлан
              </Typography>
            </CardContent>
            <Divider />
            <CardActions>
              <Button size="small" onClick={() => navigate('/dashboard/reports')}>
                Дэлгэрэнгүй
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      {/* Analytics Section - Only visible to admin and manager */}
      {user && (user.role === 'admin' || user.role === 'manager') && (
        <Box sx={{ mt: 4 }}>
          <Analytics />
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
