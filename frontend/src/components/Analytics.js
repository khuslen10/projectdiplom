import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Grid, CircularProgress, 
  Card, CardContent, Divider, useTheme, alpha
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Analytics = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    departmentStats: [],
    attendanceStats: [],
    performanceStats: [],
    salaryStats: [],
    overallStats: {}
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Одоогийн огнооны мэдээллийг авах
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        // Хэлтсийн хуваарилалтын мэдээллийг авах
        const deptRes = await axios.get(`/stats/department`);
        
        // Одоогийн сарын ирцийн статистикийг авах
        const attendanceRes = await axios.get(
          `/stats/attendance?month=${currentMonth}&year=${currentYear}`
        );
        
        // Гүйцэтгэлийн статистикийг авах
        const performanceRes = await axios.get(
          `/stats/performance?year=${currentYear}`
        );
        
        // Цалингийн статистикийг авах
        const salaryRes = await axios.get(
          `/stats/salary?year=${currentYear}`
        );
        
        // Ерөнхий статистикийг авах
        const overallRes = await axios.get(`/stats/overall`);
        
        // Хэлтсийн өгөгдлийг харуулахад бэлтгэх
        const departmentStats = deptRes.data.map((dept, index) => ({
          name: dept.department || 'Хэлтэсгүй',
          value: dept.count,
          color: COLORS[index % COLORS.length]
        }));
        
        setData({
          departmentStats: departmentStats,
          attendanceStats: attendanceRes.data,
          performanceStats: performanceRes.data,
          salaryStats: salaryRes.data,
          overallStats: overallRes.data
        });
        
      } catch (err) {
        console.error('Аналитик мэдээлэл авахад алдаа гарлаа:', err);
        setError('Мэдээлэл авахад алдаа гарлаа');
        // Ямар нэг алдаа гарвал жишиг өгөгдлийг ашиглана
        setData(getMockData());
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // API цэгүүд бэлэн биш бол харуулах жишиг өгөгдөл
  const getMockData = () => {
    // Хэлтсийн хуваарилалт
    const mockDepartmentStats = [
      { name: 'IT', value: 5, color: COLORS[0] },
      { name: 'Хүний нөөц', value: 3, color: COLORS[1] },
      { name: 'Санхүү', value: 4, color: COLORS[2] },
      { name: 'Маркетинг', value: 3, color: COLORS[3] },
      { name: 'Борлуулалт', value: 4, color: COLORS[4] }
    ];
    
    // Ирцийн статистик
    const mockAttendanceStats = [
      { name: 'Ирсэн', value: 92 },
      { name: 'Хоцорсон', value: 6 },
      { name: 'Ирээгүй', value: 2 }
    ];
    
    // Хэлтсээр гүйцэтгэлийн статистик
    const mockPerformanceStats = [
      { department: 'IT', rating: 4.2 },
      { department: 'Хүний нөөц', rating: 4.5 },
      { department: 'Санхүү', rating: 3.8 },
      { department: 'Маркетинг', rating: 4.0 },
      { department: 'Борлуулалт', rating: 4.3 }
    ];
    
    // Цалингийн хуваарилалт
    const mockSalaryStats = [
      { department: 'IT', averageSalary: 2500000 },
      { department: 'Хүний нөөц', averageSalary: 2200000 },
      { department: 'Санхүү', averageSalary: 2800000 },
      { department: 'Маркетинг', averageSalary: 2100000 },
      { department: 'Борлуулалт', averageSalary: 2400000 }
    ];
    
    // Monthly performance trends
    const mockTrendData = [
      { month: '1-р сар', performance: 3.8 },
      { month: '2-р сар', performance: 3.9 },
      { month: '3-р сар', performance: 4.0 },
      { month: '4-р сар', performance: 3.7 },
      { month: '5-р сар', performance: 4.1 },
      { month: '6-р сар', performance: 4.2 },
      { month: '7-р сар', performance: 4.3 },
      { month: '8-р сар', performance: 4.1 },
      { month: '9-р сар', performance: 4.2 }
    ];
    
    // Ерөнхий статистик
    const mockOverallStats = {
      totalEmployees: 17,
      totalDepartments: 8,
      averageSalary: 1566601,
      averageRating: 3.3125
    };
    
    return {
      departmentStats: mockDepartmentStats,
      attendanceStats: mockAttendanceStats,
      performanceStats: mockPerformanceStats,
      salaryStats: mockSalaryStats,
      trendData: mockTrendData,
      overallStats: mockOverallStats
    };
  };
  
  // Use real data if available, otherwise fall back to mock data
  const displayData = data.departmentStats.length > 0 ? data : getMockData();
  
  // Мөнгөн дүнг форматлах
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('mn-MN').format(amount) + ' ₮';
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, height: '60vh', alignItems: 'center' }}>
        <CircularProgress size={50} thickness={4} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ mb: 0, maxWidth: '100%', width: '100%', pr: 0 }}>
      {/* Main stat cards */}
      <Box mb={1} sx={{ width: '100%' }}>
        <Grid container spacing={1} sx={{ width: '100%', margin: 0 }}>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
            <Card sx={{ 
              height: '100%', 
              boxShadow: 1,
              background: alpha(theme.palette.primary.main, 0.05),
              position: 'relative',
              overflow: 'hidden',
              width: '100%'
            }}>
              <Box sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PersonIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
              </Box>
              <CardContent sx={{ p: 1.5 }}>
                <Typography variant="overline" color="textSecondary" gutterBottom>
                  Нийт ажилтан
                </Typography>
                <Typography variant="h3" component="div" fontWeight="bold">
                  {displayData.overallStats.totalEmployees || 17}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                  {displayData.departmentStats.length} хэлтэст хуваарилагдсан
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
            <Card sx={{ 
              height: '100%', 
              boxShadow: 1,
              background: alpha(theme.palette.success.main, 0.05),
              position: 'relative',
              overflow: 'hidden',
              width: '100%'
            }}>
              <Box sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.success.main, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircleIcon sx={{ fontSize: 20, color: theme.palette.success.main }} />
              </Box>
              <CardContent sx={{ p: 1.5 }}>
                <Typography variant="overline" color="textSecondary" gutterBottom>
                  Ирцийн дундаж
                </Typography>
                <Typography variant="h3" component="div" fontWeight="bold">
                  {displayData.attendanceStats.find(item => item.name === 'Ирсэн')?.value || 76}%
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                  Энэ сарын байдлаар
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
            <Card sx={{ 
              height: '100%', 
              boxShadow: 1,
              background: alpha(theme.palette.warning.main, 0.05),
              position: 'relative',
              overflow: 'hidden',
              width: '100%'
            }}>
              <Box sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.warning.main, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <StarIcon sx={{ fontSize: 20, color: theme.palette.warning.main }} />
              </Box>
              <CardContent sx={{ p: 1.5 }}>
                <Typography variant="overline" color="textSecondary" gutterBottom>
                  Дундаж үнэлгээ
                </Typography>
                <Typography variant="h3" component="div" fontWeight="bold">
                  {displayData.overallStats.averageRating || 3.3125}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                  5 оноон дээр
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
            <Card sx={{ 
              height: '100%', 
              boxShadow: 1,
              background: alpha(theme.palette.info.main, 0.05),
              position: 'relative',
              overflow: 'hidden',
              width: '100%'
            }}>
              <Box sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.info.main, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MoneyIcon sx={{ fontSize: 20, color: theme.palette.info.main }} />
              </Box>
              <CardContent sx={{ p: 1.5 }}>
                <Typography variant="overline" color="textSecondary" gutterBottom>
                  Дундаж цалин
                </Typography>
                <Typography variant="h3" component="div" fontWeight="bold" sx={{ 
                  fontSize: { xs: '1.5rem', sm: '1.8rem' } 
                }}>
                  {formatCurrency(displayData.overallStats.averageSalary || 1566601)}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                  Сарын дундаж
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      <Typography variant="h5" fontWeight="medium" gutterBottom mb={1}>
        Байгууллагын тойм
      </Typography>
      
      {/* Charts - make them use full width */}
      <Grid container spacing={1} sx={{ width: '100%', margin: 0 }}>
        <Grid item xs={12} md={6} lg={6} xl={6}>
          <Paper sx={{ p: 1.5, height: '100%', boxShadow: 1, borderRadius: '6px', width: '100%' }}>
            <Typography variant="h6" fontWeight="medium" gutterBottom mb={0.5}>
              Хэлтсийн бүтэц
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayData.departmentStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={1}
                  >
                    {displayData.departmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} ажилтан (${(props.percent * 100).toFixed(0)}%)`, 
                      name
                    ]} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={6} xl={6}>
          <Paper sx={{ p: 1.5, height: '100%', boxShadow: 1, borderRadius: '6px', width: '100%' }}>
            <Typography variant="h6" fontWeight="medium" gutterBottom mb={0.5}>
              Ирцийн тойм
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={displayData.attendanceStats}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <defs>
                    {displayData.attendanceStats.map((entry, index) => (
                      <linearGradient key={`gradient-${index}`} id={`colorValue${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.2}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Хувь']} />
                  <Legend />
                  {displayData.attendanceStats.map((entry, index) => (
                    <Area 
                      key={`area-${index}`}
                      type="monotone" 
                      dataKey="value" 
                      name={entry.name}
                      stroke={COLORS[index % COLORS.length]} 
                      fillOpacity={1} 
                      fill={`url(#colorValue${index})`} 
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={6} xl={6}>
          <Paper sx={{ p: 1.5, height: '100%', boxShadow: 1, borderRadius: '6px', width: '100%' }}>
            <Typography variant="h6" fontWeight="medium" gutterBottom mb={0.5}>
              Гүйцэтгэлийн үнэлгээ
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={displayData.performanceStats}>
                  <PolarGrid gridType="polygon" />
                  <PolarAngleAxis dataKey="department" tick={{ fill: theme.palette.text.primary }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} />
                  <Radar 
                    name="Дундаж үнэлгээ" 
                    dataKey="rating" 
                    stroke={theme.palette.primary.main} 
                    fill={theme.palette.primary.main} 
                    fillOpacity={0.6} 
                  />
                  <Tooltip formatter={(value) => [`${value}/5`, 'Үнэлгээ']} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={6} xl={6}>
          <Paper sx={{ p: 1.5, height: '100%', boxShadow: 1, borderRadius: '6px', width: '100%' }}>
            <Typography variant="h6" fontWeight="medium" gutterBottom mb={0.5}>
              Цалингийн харьцуулалт
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={displayData.salaryStats}
                  margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Дундаж цалин']} />
                  <Legend />
                  <Bar 
                    dataKey="averageSalary" 
                    name="Дундаж цалин" 
                    radius={[4, 4, 0, 0]} 
                    fill={theme.palette.info.main} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
